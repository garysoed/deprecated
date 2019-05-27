import { Vine } from '@grapevine';
import { assert, setup, should, test } from '@gs-testing';
import { filterNonNull } from '@gs-tools/rxjs';
import { $window, _v } from '@mask';
import { createFakeWindow } from '@persona/testing';
import { map, shareReplay, switchMap, take, tap, withLatestFrom } from '@rxjs/operators';
import { createPath } from '../../datamodel/folder-path';
import { $itemCollection } from '../../datamodel/item-collection';
import { parseId } from '../../datamodel/item-id';
import { $selectedFolderId, $selectedFolderMetadata } from './selected-folder';

test('@thoth/view/folder/selected-folder', () => {
  let fakeWindow: Window;
  let vine: Vine;

  setup(() => {
    fakeWindow = createFakeWindow();
    vine = _v.build('test');
    $window.get(vine).next(fakeWindow);
  });

  test('selectedFolderId', () => {
    should(`return the correct folder Id`, () => {
      const folderId = parseId(`lo_folderId`);
      const path = createPath([
        parseId('lo_a'),
        parseId('lo_b'),
        parseId('lo_c'),
        folderId,
      ]);
      fakeWindow.history.pushState(
          {},
          '',
          `/p/${path}`);
      fakeWindow.dispatchEvent(new CustomEvent('popstate'));

      assert($selectedFolderId.get(vine).pipe(filterNonNull(), map(id => id.toString())))
          .to.emitWith(folderId.toString());
    });

    should(`return null if location is not PROJECT`, () => {
      fakeWindow.history.pushState({}, '', `/`);
      fakeWindow.dispatchEvent(new CustomEvent('popstate'));

      assert($selectedFolderId.get(vine)).to.emitWith(null);
    });
  });

  test('selectedFolderMetadata', () => {
    should(`return the correct metadata`, () => {
      const metadataObs = $itemCollection.get(vine)
          .pipe(
              switchMap(collection => collection
                  .newLocalFolder()
                  .pipe(switchMap(metadata => collection.setItem(metadata))),
              ),
              shareReplay(1),
          );

      metadataObs
          .pipe(
              tap(metadata => {
                fakeWindow.history.pushState({}, '', `/p/${metadata.id}`);
                fakeWindow.dispatchEvent(new CustomEvent('popstate'));
              }),
          )
          .subscribe();

      $selectedFolderMetadata.get(vine)
          .pipe(
              take(1),
              withLatestFrom(metadataObs),
              tap(([selected, metadata]) => {
                assert(selected!.id.toString()).to.equal(metadata.id.toString());
              }),
          )
          .subscribe();
    });

    should(`return null if location is not PROJECT`, () => {
      fakeWindow.history.pushState({}, '', `/`);
      fakeWindow.dispatchEvent(new CustomEvent('popstate'));

      assert($selectedFolderMetadata.get(vine)).to.emitWith(null);
    });
  });
});
