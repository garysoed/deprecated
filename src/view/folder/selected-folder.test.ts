import { Vine } from '@grapevine';
import { assert, setup, should, test } from '@gs-testing';
import { $window, _v } from 'mask/export';
import { createFakeWindow } from 'persona/export/testing';
import { shareReplay, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { createPath } from 'src/datamodel/folder-path';
import { $itemMetadataCollection } from 'src/datamodel/item-metadata-collection';
import { SourceType } from 'src/datamodel/source-type';
import { LocalSource } from 'src/datamodel/source/local-source';
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
    should(`return the correct folder Id`, async () => {
      const folderId = 'folderId';
      fakeWindow.history.pushState({}, '', `/p/${createPath(['a', 'b', 'c', folderId])}`);
      fakeWindow.dispatchEvent(new CustomEvent('popstate'));

      await assert($selectedFolderId.get(vine)).to.emitWith(folderId);
    });

    should(`return null if location is not PROJECT`, async () => {
      fakeWindow.history.pushState({}, '', `/`);
      fakeWindow.dispatchEvent(new CustomEvent('popstate'));

      await assert($selectedFolderId.get(vine)).to.emitWith(null);
    });
  });

  test('selectedFolderMetadata', () => {
    should(`return the correct metadata`, async () => {
      const metadataObs = $itemMetadataCollection.get(vine)
          .pipe(
              switchMap(collection => collection
                  .newLocalFolderMetadata(true, new LocalSource({type: SourceType.LOCAL}))
                  .pipe(switchMap(metadata => collection.setMetadata(metadata))),
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
                assert(selected!.id).to.equal(metadata.id);
              }),
          )
          .subscribe();
    });

    should(`return null if location is not PROJECT`, async () => {
      fakeWindow.history.pushState({}, '', `/`);
      fakeWindow.dispatchEvent(new CustomEvent('popstate'));

      await assert($selectedFolderMetadata.get(vine)).to.emitWith(null);
    });
  });
});
