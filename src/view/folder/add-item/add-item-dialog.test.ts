import { assert, match, setup, should, test } from '@gs-testing';
import { filterNonNull } from '@gs-tools/rxjs';
import { _p } from '@mask';
import { DialogTester } from '@mask/testing';
import { PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { Observable, of as observableOf, ReplaySubject } from '@rxjs';
import { filter, map, shareReplay, switchMap, take, withLatestFrom } from '@rxjs/operators';
import { $itemService } from '../../../datamodel/item-service';
import { ItemType } from '../../../datamodel/item-type';
import { LocalFolder, localFolderFactory } from '../../../datamodel/local-folder';
import { $localFolderCollection } from '../../../datamodel/local-folder-collection';
import { SourceType } from '../../../datamodel/source-type';
import { LocalItemId, toItemString } from '../../../serializable/item-id';
import { FakeGapiClient, installFakeGapiClient } from '../../../testing/fake-gapi';
import { ItemClickEvent } from '../item-click-event';
import { $, AddItemDialog, openDialog } from './add-item-dialog';

test('@thoth/view/folder/add-item/add-item-dialog', () => {
  const factory = new PersonaTesterFactory(_p);

  let localFolderIdObs: Observable<LocalItemId>;
  let fakeGapi: FakeGapiClient;
  let tester: PersonaTester;
  let dialogTester: DialogTester;

  setup(() => {
    tester = factory.build([AddItemDialog]);
    dialogTester = new DialogTester(tester, document.body, tester.vine);
    fakeGapi = installFakeGapiClient(tester.vine);

    localFolderIdObs = $localFolderCollection.get(tester.vine)
        .pipe(
            take(1),
            switchMap(collection => {
              return collection.create().pipe(
                  switchMap(item => collection.update(item)),
              );
            }),
            map(item => item.id),
            shareReplay(1),
        );

    localFolderIdObs.pipe(
        take(1),
        switchMap(id => openDialog(
          tester.vine,
          localFolderFactory.create({
            contentIds: [],
            id: id as LocalItemId,
            isEditable: true,
            name: 'local',
            type: ItemType.FOLDER,
          }),
        )),
    )
    .subscribe();
  });

  test('renderSearchResults', () => {
    should(`render the files correctly`, () => {
      const query = 'query';
      const id1 = 'id1';
      const id2 = 'id2';
      const id3 = 'id3';
      const name1 = 'name1';
      const name2 = 'name2';
      const name3 = 'name3';

      dialogTester.getContentObs().setAttribute($.search._.value, query).subscribe();
      fakeGapi.drive.files.listSubject.next({
        result: {
          files: [
            {id: id1, mimeType: 'application/x-javascript', name: name1},
            {id: id2, mimeType: 'application/vnd.google-apps.folder', name: name2},
            {id: id3, mimeType: 'text/plain', name: name3},
          ],
        },
      });

      const nodesObs = dialogTester.getContentObs()
          .getNodesAfter($.results._.list)
          .pipe(
              map(nodes => nodes
                  .filter((node): node is HTMLElement => node instanceof HTMLElement),
              ),
          );

      assert(nodesObs.pipe(map(nodes => nodes.length))).to.emitWith(3);

      const labelsObs = nodesObs.pipe(
          map(nodes => nodes.map(node => node.getAttribute('label'))),
      );
      assert(labelsObs).to
          .emitWith(match.anyArrayThat<string>().haveExactElements([name1, name2, name3]));

      const idsObs = nodesObs.pipe(
          map(nodes => nodes.map(node => node.getAttribute('item-id'))),
      );
      assert(idsObs).to.emitWith(match.anyArrayThat<string>().haveExactElements([
        `dr_${id1}`,
        `dr_${id2}`,
        `dr_${id3}`,
      ]));

      const typesObs = nodesObs
          .pipe(map(nodes => nodes.map(node => node.getAttribute('item-type'))));
      assert(typesObs).to.emitWith(match.anyArrayThat<string>().haveExactElements([
        ItemType.CONVERTER,
        ItemType.FOLDER,
        ItemType.UNKNOWN,
      ]));

      const sourceObs = nodesObs
          .pipe(map(nodes => nodes.map(node => node.getAttribute('source-type'))));
      assert(sourceObs).to.emitWith(match.anyArrayThat<string>().haveExactElements([
        SourceType.DRIVE,
        SourceType.DRIVE,
        SourceType.DRIVE,
      ]));

      // Click one of the items.
      dialogTester.getContentObs()
          .dispatchEvent($.results._.dispatchItemClick, new ItemClickEvent(`dr_${id2}`))
          .subscribe();

      const selectedObs = nodesObs.pipe(
          map(nodes => nodes.map(node => node.getAttribute('selected'))),
          switchMap(selected => observableOf(...selected)),
      );
      assert(selectedObs).to.emitSequence([null, '', null]);
    });
  });

  test('setupUpdateResults', () => {
    should(`perform the search correctly`, async () => {
      const query = 'query';
      const id = 'id';
      const name = 'name';

      fakeGapi.drive.files.listSubject.next({
        result: {
          files: [{id, name}],
        },
      });

      dialogTester.getContentObs()
          .setAttribute($.search._.value, query)
          .subscribe();

      const nodesObs = dialogTester.getContentObs()
            .getNodesAfter($.results._.list)
            .pipe(
              map(nodes => nodes
                  .filter((node): node is HTMLElement => node instanceof HTMLElement),
              ),
          );

      const idsObs = nodesObs.pipe(map(nodes => nodes.map(node => node.getAttribute('item-id'))));
      assert(idsObs).to.emitWith(match.anyArrayThat<string>()
          .haveExactElements([`dr_${id}`]));

      assert(fakeGapi.drive.files.list).to.haveBeenCalledWith(match.anyObjectThat().haveProperties({
        q: `name contains '${query}'`,
      }));
    });
  });

  test('onClose', () => {
    const ID = 'ID';
    let resultsObs: ReplaySubject<HTMLElement>;
    let contentIdsObs: Observable<string[]>;

    setup(() => {
      // Sets up the search.
      fakeGapi.drive.files.listSubject.next({
        result: {
          files: [{id: ID, name: 'name'}],
        },
      });

      dialogTester.getContentObs().setAttribute($.search._.value, 'query').subscribe();

      resultsObs = new ReplaySubject(1);
      dialogTester.getContentObs()
          .getNodesAfter($.results._.list)
          .pipe(
              switchMap(nodes => observableOf(...nodes)),
              filter((node): node is HTMLElement => node instanceof HTMLElement),
          )
          .subscribe(resultsObs);

      contentIdsObs = $itemService.get(tester.vine)
          .pipe(
              withLatestFrom(localFolderIdObs),
              switchMap(([collection, localFolderId]) => collection.getItem(localFolderId)),
              filterNonNull(),
              filter((item): item is LocalFolder => localFolderFactory.factoryOf(item)),
              map(localFolder => localFolder.contentIds.map(id => id.id)),
          );
    });

    should(`add the new item`, () => {
      // Select the item.
      dialogTester.getContentObs()
          .dispatchEvent(
              $.results._.dispatchItemClick,
              new ItemClickEvent(toItemString({id: ID, source: SourceType.DRIVE})),
          )
          .pipe(take(1))
          .subscribe();
      dialogTester.clickOk().subscribe();

      assert(contentIdsObs).to.emitWith(match.anyArrayThat<string>().haveExactElements([ID]));
    });

    should(`do nothing if no items were selected`, () => {
      dialogTester.clickOk().subscribe();

      assert(contentIdsObs).to.emitWith(match.anyArrayThat<string>().haveExactElements([]));
    });

    should(`do nothing if canceled`, () => {
      // Select the item.
      dialogTester.getContentObs()
          .dispatchEvent(
              $.results._.dispatchItemClick,
              new ItemClickEvent(toItemString({id: ID, source: SourceType.DRIVE})),
          )
          .pipe(take(1))
          .subscribe();
      dialogTester.clickCancel().subscribe();

      assert(contentIdsObs).to.emitWith(match.anyArrayThat<string>().haveExactElements([]));
    });
  });
});
