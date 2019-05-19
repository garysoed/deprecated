import { assert, setup, should, test } from '@gs-testing';
import { $window, _p } from '@mask';
import { createFakeWindow, PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { switchMap, tap } from '@rxjs/operators';
import { createPath } from '../../datamodel/folder-path';
import { $itemMetadataCollection } from '../../datamodel/item-metadata-collection';
import { LocalSource } from '../../datamodel/local-source';
import { SourceType } from '../../datamodel/source-type';
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
                  .newMetadata(
                      true,
                      new LocalSource({type: SourceType.LOCAL}),
                  )
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

    should(`disable if not editable`, async () => {
      $itemMetadataCollection.get(tester.vine)
          .pipe(
              switchMap(collection => collection
                  .newMetadata(
                      false,
                      new LocalSource({type: SourceType.LOCAL}),
                  )
                  .pipe(switchMap(newMetadata => collection.setMetadata(newMetadata))),
              ),
              tap(newMetadata => {
                fakeWindow.history.pushState({}, '', `/p/${newMetadata.id}`);
                fakeWindow.dispatchEvent(new CustomEvent('popstate'));
              }),
          )
          .subscribe();

      await assert(tester.hasAttribute(el, $.addItem._.disabled)).to.emitWith(true);
    });

    should(`disable if item does not exist`, async () => {
      fakeWindow.history.pushState({}, '', `/p/other`);
      fakeWindow.dispatchEvent(new CustomEvent('popstate'));

      await assert(tester.hasAttribute(el, $.addItem._.disabled)).to.emitWith(true);
    });
  });
});
