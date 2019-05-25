import { assert, setup, should, test } from '@gs-testing';
import { $dialogService, $window, _p, ActionEvent } from '@mask';
import { createFakeWindow, PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { map, switchMap, tap } from '@rxjs/operators';
import { $itemMetadataCollection } from '../../datamodel/item-collection';
import { $, FolderSidebar } from './folder-sidebar';

test('@thoth/view/folder/folder-sidebar', () => {
  const factory = new PersonaTesterFactory(_p);
  let tester: PersonaTester;
  let el: HTMLElement;
  let fakeWindow: Window;

  setup(() => {
    fakeWindow = createFakeWindow();

    tester = factory.build([FolderSidebar]);
    $window.get(tester.vine).next(fakeWindow);

    el = tester.createElement('th-folder-sidebar', document.body);
  });

  test('renderAddItemDisabled', () => {
    should(`enable if editable`, async () => {
      $itemMetadataCollection.get(tester.vine)
          .pipe(
              switchMap(collection => collection
                  .newLocalFolderMetadata()
                  .pipe(switchMap(newMetadata => collection.setMetadata(newMetadata))),
              ),
              tap(newMetadata => {
                fakeWindow.history.pushState({}, '', `/p/${newMetadata.id}`);
                fakeWindow.dispatchEvent(new CustomEvent('popstate'));
              }),
          )
          .subscribe();

      await assert(tester.hasAttribute(el, $.addItem._.disabled)).to.emitWith(false);
    });

    // should(`disable if not editable`, async () => {
    //   $itemMetadataCollection.get(tester.vine)
    //       .pipe(
    //           switchMap(collection => collection
    //               .newLocalFolderMetadata()
    //               .pipe(switchMap(newMetadata => collection.setMetadata(newMetadata))),
    //           ),
    //           tap(newMetadata => {
    //             fakeWindow.history.pushState({}, '', `/p/${newMetadata.id}`);
    //             fakeWindow.dispatchEvent(new CustomEvent('popstate'));
    //           }),
    //       )
    //       .subscribe();

    //   await assert(tester.hasAttribute(el, $.addItem._.disabled)).to.emitWith(true);
    // });

    should(`disable if item does not exist`, async () => {
      fakeWindow.history.pushState({}, '', `/p/other`);
      fakeWindow.dispatchEvent(new CustomEvent('popstate'));

      await assert(tester.hasAttribute(el, $.addItem._.disabled)).to.emitWith(true);
    });
  });

  test('setupAddItemClick', () => {
    should(`open the dialog correctly`, async () => {
      tester.dispatchEvent(el, $.addItem._.actionEvent, new ActionEvent()).subscribe();

      const isOpenObs = $dialogService.get(tester.vine)
          .pipe(
              switchMap(service => service.getStateObs()),
              map(state => state.isOpen),
          );
      await assert(isOpenObs).to.emitWith(true);
    });
  });
});
