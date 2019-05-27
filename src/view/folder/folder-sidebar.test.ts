import { assert, setup, should, test } from '@gs-testing';
import { $dialogService, $window, _p, ActionEvent } from '@mask';
import { createFakeWindow, PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { Observable } from '@rxjs';
import { map, shareReplay, switchMap, tap } from '@rxjs/operators';
import { $itemCollection } from '../../datamodel/local-folder-collection';
import { LocalFolder } from '../../datamodel/local-folder';
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
    should(`enable if editable`, () => {
      $itemCollection.get(tester.vine)
          .pipe(
              switchMap(collection => collection
                  .create()
                  .pipe(switchMap(newMetadata => collection.update(newMetadata))),
              ),
              tap(newMetadata => {
                fakeWindow.history.pushState({}, '', `/p/${newMetadata.id}`);
                fakeWindow.dispatchEvent(new CustomEvent('popstate'));
              }),
          )
          .subscribe();

      assert(tester.hasAttribute(el, $.addItem._.disabled)).to.emitWith(false);
    });

    // should(`disable if not editable`, () => {
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

    //   assert(tester.hasAttribute(el, $.addItem._.disabled)).to.emitWith(true);
    // });

    should(`disable if item does not exist`, () => {
      fakeWindow.history.pushState({}, '', `/p/other`);
      fakeWindow.dispatchEvent(new CustomEvent('popstate'));

      assert(tester.hasAttribute(el, $.addItem._.disabled)).to.emitWith(true);
    });
  });

  test('setupAddItemClick', () => {
    let localFolderObs: Observable<LocalFolder>;

    setup(() => {
      localFolderObs = $itemCollection.get(tester.vine)
          .pipe(
              switchMap(collection => {
                return collection.create()
                    .pipe(switchMap(localFolder => collection.update(localFolder)));
              }),
              shareReplay(1),
          );
    });

    should(`open the dialog correctly`, () => {
      localFolderObs.subscribe(localFolder => {
        fakeWindow.history.pushState({}, '', `/p/${localFolder.id.toString()}`);
        fakeWindow.dispatchEvent(new CustomEvent('popstate'));
      });

      tester.dispatchEvent(el, $.addItem._.actionEvent, new ActionEvent()).subscribe();

      const isOpenObs = $dialogService.get(tester.vine)
          .pipe(
              switchMap(service => service.getStateObs()),
              map(state => state.isOpen),
          );
      assert(isOpenObs).to.emitWith(true);
    });

    should(`not open the dialog if the selected item is not local folder`, () => {
      fakeWindow.history.pushState({}, '', `/p/notexist`);
      fakeWindow.dispatchEvent(new CustomEvent('popstate'));

      tester.dispatchEvent(el, $.addItem._.actionEvent, new ActionEvent()).subscribe();

      const isOpenObs = $dialogService.get(tester.vine)
          .pipe(
              switchMap(service => service.getStateObs()),
              map(state => state.isOpen),
          );
      assert(isOpenObs).to.emitWith(false);
    });
  });
});
