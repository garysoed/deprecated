import { Vine } from '@grapevine';
import { ArrayDiff, ArraySubject, filterNonNull, mapArray, MapSubject, scanArray, scanMap } from '@gs-tools/rxjs';
import { ElementWithTagType, InstanceofType } from '@gs-types';
import { $dialogService, $textInput, _p, _v, Dialog, TextInput, ThemedCustomElementCtrl } from '@mask';
import { api, element, InitFn, repeated, RepeatedSpec } from '@persona';
import { BehaviorSubject, merge, Observable, of as observableOf } from '@rxjs';
import { filter, map, pairwise, startWith, switchMap, take, tap, withLatestFrom } from '@rxjs/operators';
import { $driveClient } from '../../api/drive-client';
import { driveItemFactory } from '../../datamodel/drive-item';
import { Item } from '../../datamodel/item';
import { LocalFolder } from '../../datamodel/local-folder';
import { $localFolderCollection } from '../../datamodel/local-folder-collection';
import { toItemString } from '../../serializable/item-id';
import { SerializableDriveFile } from '../../serializable/serializable-drive-file';
import template from './add-item-dialog.html';
import { $$ as $fileListItem, FileListItem } from './file-list-item';

export const $ = {
  results: element('results', InstanceofType(HTMLDivElement), {
    ...api($fileListItem),
    list: repeated('#list', 'th-file-list-item'),
  }),
  search: element('search', ElementWithTagType('mk-text-input'), api($textInput)),
};

const $addedItem = _v.source(() => new BehaviorSubject<Item|null>(null), globalThis);

@_p.customElement({
  dependencies: [Dialog, FileListItem, TextInput],
  tag: 'th-add-item-dialog',
  template,
})
export class AddItemDialog extends ThemedCustomElementCtrl {
  private readonly driveClient = $driveClient.asObservable();
  private readonly onClickResult = _p.input($.results._.dispatchItemClick, this);
  private readonly onSearchValue = _p.input($.search._.value, this);
  private readonly resultDataMap = new MapSubject<string, SerializableDriveFile>();
  private readonly resultIdsSubject = new ArraySubject<string>();
  private readonly selectedItemSbj = $addedItem.asSubject();

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      () => this.setupUpdateResults(),
      () => this.setupOnClickResult(),
      _p.render($.results._.list).withVine(_v.stream(this.renderSearchResults, this)),
    ];
  }

  private renderSearchResults(): Observable<ArrayDiff<RepeatedSpec>> {
    const fromSearchResultsObs = this.resultIdsSubject.getDiffs().pipe(
        withLatestFrom(
            this.resultDataMap.getDiffs().pipe(scanMap()),
            this.selectedItemSbj,
        ),
        switchMap(([diff, data, selectedItem]) => observableOf(diff).pipe(
            mapArray(id => createRenderSpec(id, data, selectedItem)),
        )),
    );

    const fromSelectedObs = this.selectedItemSbj.pipe(
        startWith(null),
        pairwise(),
        filter(([prev, next]) => {
          if (prev === null) {
            return !!next;
          }

          if (next === null) {
            return !!prev;
          }

          return prev.id !== next.id;
        }),
        withLatestFrom(
            this.resultDataMap.getDiffs().pipe(scanMap()),
            this.resultIdsSubject.getDiffs().pipe(scanArray()),
        ),
        switchMap(([[prevSelected, nextSelected], data, resultIds]):
            Observable<ArrayDiff<RepeatedSpec>> => {
          const specs: Array<ArrayDiff<RepeatedSpec>> = [];
          for (let i = 0; i < resultIds.length; i++) {
            const result = resultIds[i];
            if ((prevSelected && toItemString(prevSelected.id) === result)
                || (nextSelected && toItemString(nextSelected.id) === result)) {
              specs.push({
                index: i,
                type: 'set',
                value: createRenderSpec(result, data, nextSelected),
              });
            }
          }

          return observableOf(...specs);
        }),
    );

    return merge(fromSearchResultsObs, fromSelectedObs);
  }

  private setupOnClickResult(): Observable<unknown> {
    return this.onClickResult
        .pipe(
            withLatestFrom(this.resultDataMap.getDiffs().pipe(scanMap())),
            map(([event, resultsMap]) => resultsMap.get(event.itemId) || null),
            filterNonNull(),
            tap(driveFile => this.selectedItemSbj.next(
                driveItemFactory.create(driveFile),
            )),
        );
  }

  private setupUpdateResults(): Observable<unknown> {
    return this.onSearchValue.pipe(
        withLatestFrom(this.driveClient),
        switchMap(([query, driveClient]) => driveClient.find(`name contains '${query}'`)),
        tap(results => {
          const ids = [];
          for (const result of results) {
            if (!result.id) {
              continue;
            }

            const id = toItemString(result.id);
            ids.push(id);
            this.resultDataMap.set(id, result);
          }

          this.resultIdsSubject.setAll(ids);
        }),
    );
  }
}

export function openDialog(vine: Vine, folder: LocalFolder): Observable<unknown> {
  return $dialogService.get(vine)
      .pipe(
          take(1),
          switchMap(
              service => service.open({
                cancelable: true,
                content: {tag: 'th-add-item-dialog'},
                source: $addedItem,
                title: 'Add item',
              }),
          ),
          filter(result => !result.canceled),
          map(result => result.value),
          filterNonNull(),
          switchMap(result => onClose(result, folder, vine)),
      );
}

function onClose(item: Item, folder: LocalFolder, vine: Vine): Observable<any> {
  return $localFolderCollection.get(vine)
      .pipe(
          switchMap(collection => {
            return collection.update(
              folder.$update(folder.$set.contentIds([...folder.contentIds, item.id])),

          ); }),
          take(1),
      );
}


function createRenderSpec(
    id: string,
    data: Map<string, SerializableDriveFile>,
    selectedItem: Item|null,
): RepeatedSpec {
  const file = data.get(id);
  if (!file) {
    return {};
  }

  const item = driveItemFactory.create(file);
  const attr = new Map([
    ['item-id', toItemString(item.id)],
    ['item-type', item.type],
    ['label', item.name],
    ['source-type', item.id.source],
  ]);

  if (selectedItem && toItemString(selectedItem.id) === id) {
    attr.set('selected', '');
  }

  return {attr};
}
