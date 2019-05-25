import { _v } from '@mask';
import { of as observableOf } from '@rxjs';
import { map, switchMap, withLatestFrom } from '@rxjs/operators';
import { getFolderIds } from '../../datamodel/folder-path';
import { $itemMetadataCollection } from '../../datamodel/item-collection';
import { $locationService } from '../../main/route';

export const $selectedFolderId = _v.stream(
    vine => {
      return $locationService.get(vine)
          .pipe(
              switchMap(locationService => locationService.getLocation()),
              map(location => {
                if (location.type !== 'PROJECT') {
                  return null;
                }

                const folderIds = getFolderIds(location.payload.route);

                return folderIds[folderIds.length - 1] || null;
              }),
          );
    },
    globalThis,
);

export const $selectedFolderMetadata = _v.stream(
    vine => $selectedFolderId.get(vine)
        .pipe(
            withLatestFrom($itemMetadataCollection.get(vine)),
            switchMap(([selectedFolderId, collection]) => {
              if (!selectedFolderId) {
                return observableOf(null);
              }

              return collection.getMetadata(selectedFolderId);
            }),
        ),
    globalThis,
);
