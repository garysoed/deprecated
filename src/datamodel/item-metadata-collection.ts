import { EditableStorage, LocalStorage } from '@gs-tools/store';
import { _v } from '@mask';
import { Observable, of as observableOf } from '@rxjs';
import { map, mapTo, shareReplay, take } from '@rxjs/operators';
import { SERIALIZABLE_ITEM_METADATA_CONVERTER, SerializableItemMetadata } from '../serializable/serializable-item-metadata';
import { ItemMetadata } from './item-metadata';
import { Source } from './source';

export class ItemMetadataCollection {
  constructor(private readonly storage: EditableStorage<SerializableItemMetadata>) { }

  deleteMetadata(itemId: string): Observable<unknown> {
    return this.storage.delete(itemId);
  }

  getMetadata(itemId: string): Observable<ItemMetadata|null> {
    return this.storage.read(itemId)
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

  newMetadata(isEditable: boolean, source: Source): Observable<ItemMetadata> {
    return this.storage.generateId()
        .pipe(
            take(1),
            map(metadataId => new ItemMetadata({
              id: metadataId,
              isEditable,
              name: 'New item',
              source: source.serializable,
            })),
            shareReplay(1),
        );
  }

  setMetadata(metadata: ItemMetadata): Observable<ItemMetadata> {
    return this.storage.update(metadata.id, metadata.serializable)
        .pipe(mapTo(metadata));
  }
}

export const $itemMetadataCollection = _v.stream(
    () => observableOf(
        new ItemMetadataCollection(
            new LocalStorage(
                window,
                'th2.im',
                SERIALIZABLE_ITEM_METADATA_CONVERTER,
            ),
        ),
    ),
    globalThis,
);
