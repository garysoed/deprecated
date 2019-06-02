import { EditableStorage, LocalStorage } from '@gs-tools/store';
import { _v } from '@mask';
import { Observable, of as observableOf } from '@rxjs';
import { map, mapTo, shareReplay, take } from '@rxjs/operators';
import { LocalItemId, toItemString } from '../serializable/item-id';
import { SERIALIZABLE_LOCAL_FOLDER_CONVERTER, SerializableLocalFolder } from '../serializable/serializable-local-folder';
import { ItemType } from './item-type';
import { LocalFolder, localFolderFactory } from './local-folder';
import { SourceType } from './source-type';

// TODO: Handle drive files.
export class LocalFolderCollection {
  constructor(private readonly storage: EditableStorage<SerializableLocalFolder>) { }

  create(): Observable<LocalFolder> {
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

  delete(itemId: LocalItemId): Observable<unknown> {
    return this.storage.delete(toItemString(itemId));
  }

  get(itemId: LocalItemId): Observable<LocalFolder|null> {
    return this.storage.read(toItemString(itemId))
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

  update(metadata: LocalFolder): Observable<LocalFolder> {
    return this.storage.update(toItemString(metadata.id), metadata.serializable)
        .pipe(mapTo(metadata));
  }
}

export const $localFolderCollection = _v.stream(
    () => observableOf(
        new LocalFolderCollection(
            new LocalStorage(
                window,
                'th2.ic',
                SERIALIZABLE_LOCAL_FOLDER_CONVERTER,
            ),
        ),
    ),
    globalThis,
);
