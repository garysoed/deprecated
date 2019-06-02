import { _v } from '@mask';
import { of as observableOf } from '@rxjs';
import { map, switchMap, withLatestFrom } from '@rxjs/operators';
import { getFolderIds } from '../../datamodel/folder-path';
import { $itemService } from '../../datamodel/item-service';
import { $locationService } from '../../main/route';
import { LocalItemId } from '../../serializable/item-id';

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
            withLatestFrom($itemService.get(vine)),
            switchMap(([selectedFolderId, collection]) => {
              if (!selectedFolderId) {
                return observableOf(null);
              }

              return collection.getItem(selectedFolderId);
            }),
        ),
    globalThis,
);
