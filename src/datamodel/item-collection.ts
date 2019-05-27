import { EditableStorage, LocalStorage } from '@gs-tools/store';
import { _v } from '@mask';
import { Observable, of as observableOf } from '@rxjs';
import { map, mapTo, shareReplay, take } from '@rxjs/operators';
import { SERIALIZABLE_LOCAL_FOLDER_CONVERTER, SerializableLocalFolder } from '../serializable/serializable-local-folder';
import { ItemId } from './item-id';
import { ItemType } from './item-type';
import { LocalFolder, localFolderFactory } from './local-folder';
import { SourceType } from './source-type';

// TODO: Handle drive files.
export class ItemMetadataCollection {
  constructor(private readonly storage: EditableStorage<SerializableLocalFolder>) { }

  deleteMetadata(itemId: ItemId): Observable<unknown> {
    return this.storage.delete(itemId.toString());
  }

  getMetadata(itemId: ItemId): Observable<LocalFolder|null> {
    return this.storage.read(itemId.toString())
        .pipe(
            map(serializable => {
              if (!serializable) {
                return null;
              }

              return localFolderFactory.create(serializable);
            }),
            shareReplay(1),
        );
  }

  newLocalFolder(): Observable<LocalFolder> {
    return this.storage.generateId()
        .pipe(
            take(1),
            map(metadataId => localFolderFactory.create({
              contentIds: [],
              id: {id: metadataId, source: SourceType.LOCAL},
              isEditable: true,
              name: 'New item',
              type: ItemType.FOLDER,
            })),
            shareReplay(1),
        );
  }

  setItem(metadata: LocalFolder): Observable<LocalFolder> {
    return this.storage.update(metadata.id.toString(), metadata.serializable)
        .pipe(mapTo(metadata));
  }
}

export const $itemCollection = _v.stream(
    () => observableOf(
        new ItemMetadataCollection(
            new LocalStorage(
                window,
                'th2.ic',
                SERIALIZABLE_LOCAL_FOLDER_CONVERTER,
            ),
        ),
    ),
    globalThis,
);
