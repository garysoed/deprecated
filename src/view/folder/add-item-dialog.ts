import { Vine } from '@grapevine';
import { ArrayDiff, ArraySubject, mapArray, MapSubject, scanMap } from '@gs-tools/rxjs';
import { ElementWithTagType, InstanceofType } from '@gs-types';
import { $dialogService, $textInput, _p, _v, Dialog, TextInput, ThemedCustomElementCtrl } from '@mask';
import { api, element, InitFn, repeated, RepeatedSpec } from '@persona';
import { EMPTY, Observable, of as observableOf } from '@rxjs';
import { switchMap, take, tap, withLatestFrom } from '@rxjs/operators';
import { $driveClient } from '../../api/drive-client';
import template from './add-item-dialog.html';

export const $ = {
  results: element('results', InstanceofType(HTMLDivElement), {
    list: repeated('#list', 'th-add-item-list-item'),
  }),
  search: element('search', ElementWithTagType('mk-text-input'), api($textInput)),
};

@_p.customElement({
  dependencies: [Dialog, TextInput],
  tag: 'th-add-item-dialog',
  template,
})
export class AddItemDialog extends ThemedCustomElementCtrl {
  private readonly driveClient = $driveClient.asObservable();
  private readonly onSearchValue = _p.input($.search._.value, this);
  private readonly resultDataMap = new MapSubject<string, gapi.client.drive.File>();
  private readonly resultIdsSubject = new ArraySubject<string>();

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      () => this.setupUpdateResults(),
      _p.render($.results._.list).withVine(_v.stream(this.renderSearchResults, this)),
    ];
  }

  private renderSearchResults(): Observable<ArrayDiff<RepeatedSpec>> {
    return this.resultIdsSubject.getDiffs().pipe(
        withLatestFrom(this.resultDataMap.getDiffs().pipe(scanMap())),
        switchMap(([diff, data]) => observableOf(diff).pipe(
            mapArray(id => {
              const file = data.get(id);
              if (!file) {
                return {};
              }

              return {attr: new Map([['label', file.name || ''], ['drive-id', id]])};
            }),
        )),
    );
  }

  private setupUpdateResults(): Observable<unknown> {
    return this.onSearchValue.pipe(
        withLatestFrom(this.driveClient),
        switchMap(([query, driveClient]) => driveClient.find(`name contains '${query}'`)),
        tap(results => {
          const ids = [];
          const newData = new Map<string, gapi.client.drive.File>();
          for (const result of results) {
            if (!result.id) {
              continue;
            }

            ids.push(result.id);
            newData.set(result.id, result);
          }

          this.resultDataMap.addAll(newData);
          this.resultIdsSubject.setAll(ids);
        }),
    );
  }
}

export function openDialog(vine: Vine): Observable<unknown> {
  return $dialogService.get(vine)
      .pipe(
          take(1),
          switchMap(
              service => service.open({
                cancelable: true,
                content: {tag: 'th-add-item-dialog'},
                onClose,
                title: 'Add item',
              }),
          ),
      );
}

function onClose(): Observable<any> {
  return EMPTY;
}
