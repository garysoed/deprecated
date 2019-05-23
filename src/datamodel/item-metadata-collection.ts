import { EditableStorage, LocalStorage } from '@gs-tools/store';
import { _v } from '@mask';
import { Observable, of as observableOf } from '@rxjs';
import { map, mapTo, shareReplay, take } from '@rxjs/operators';
import { SERIALIZABLE_ITEM_CONVERTER, SerializableItem } from '../serializable/serializable-item';
import { ItemId } from './item-id';
import { ItemMetadata } from './item-metadata';
import { ItemType } from './item-type';
import { SourceType } from './source-type';

// TODO: Handle drive files.
export class ItemMetadataCollection {
  constructor(private readonly storage: EditableStorage<SerializableItem>) { }

  deleteMetadata(itemId: ItemId): Observable<unknown> {
    return this.storage.delete(itemId.toString());
  }

  getMetadata(itemId: ItemId): Observable<ItemMetadata|null> {
    return this.storage.read(itemId.toString())
        .pipe(
            map(serializable => {
              if (!serializable) {
                return null;
              }

              return new ItemMetadata(serializable);
            }),
            shareReplay(1),
        );
  }

  newLocalFolderMetadata(): Observable<ItemMetadata> {
    return this.storage.generateId()
        .pipe(
            take(1),
            map(metadataId => new ItemMetadata({
              id: {id: metadataId, source: SourceType.LOCAL},
              isEditable: true,
              name: 'New item',
              type: ItemType.FOLDER,
            })),
            shareReplay(1),
        );
  }

  setMetadata(metadata: ItemMetadata): Observable<ItemMetadata> {
    return this.storage.update(metadata.id.toString(), metadata.serializable)
        .pipe(mapTo(metadata));
  }
}

export const $itemMetadataCollection = _v.stream(
    () => observableOf(
        new ItemMetadataCollection(
            new LocalStorage(
                window,
                'th2.im',
                SERIALIZABLE_ITEM_CONVERTER,
            ),
        ),
    ),
    globalThis,
);
