import { assert, createSpySubject, match, setup, should, test } from '@gs-testing';
import { SimpleIdGenerator } from '@gs-tools/random';
import { filterNonNull } from '@gs-tools/rxjs';
import { EditableStorage, InMemoryStorage } from '@gs-tools/store';
import { ReplaySubject } from '@rxjs';
import { map, shareReplay, switchMap, take } from '@rxjs/operators';
import { LocalItemId, parseId, toItemString } from '../serializable/item-id';
import { SerializableItem } from '../serializable/serializable-item';
import { SerializableLocalFolder } from '../serializable/serializable-local-folder';
import { Item } from './item';
import { ItemType } from './item-type';
import { LocalFolderCollection } from './local-folder-collection';

test('@thoth/datamodel/local-folder-collection', () => {
  let storage: EditableStorage<SerializableLocalFolder>;
  let collection: LocalFolderCollection;

  setup(() => {
    storage = new InMemoryStorage(new SimpleIdGenerator());
    collection = new LocalFolderCollection(storage);
  });

  test('create', () => {
    should(`emit a new metadata that does not exist`, () => {
      const metadataId1 = parseId('lo_metadataId1');
      const metadataId2 = parseId('lo_metadataId2');
      const metadataId3 = parseId('lo_metadataId3');

      storage
          .update(
              toItemString(metadataId1),
              {
                contentIds: [],
                id: metadataId1 as LocalItemId,
                isEditable: true,
                name: 'name',
                type: ItemType.FOLDER,
              },
          )
          .subscribe();
      storage
          .update(
              toItemString(metadataId2),
              {
                contentIds: [],
                id: metadataId2 as LocalItemId,
                isEditable: true,
                name: 'name',
                type: ItemType.FOLDER,
              },
          )
          .subscribe();
      storage
          .update(
              toItemString(metadataId3),
              {
                contentIds: [],
                id: metadataId3 as LocalItemId,
                isEditable: true,
                name: 'name',
                type: ItemType.FOLDER,
              },
          )
          .subscribe();

      const newMetadataObs = collection.create()
          .pipe(take(1), shareReplay(1));

      assert(newMetadataObs.pipe(map(({isEditable}) => isEditable))).to.emitWith(true);

      const storedNewMetadata = newMetadataObs
          .pipe(switchMap(newMetadata => collection.get(newMetadata.id as LocalItemId)));
      assert(storedNewMetadata).to.emitWith(null);
    });
  });

  test('delete', () => {
    should(`delete the folder correctly`, () => {
      const itemId = parseId('lo_itemId') as LocalItemId;
      const itemName = `Test Item`;
      const serializable = {
        contentIds: [],
        id: itemId as LocalItemId,
        isEditable: true,
        name: itemName,
        type: ItemType.FOLDER,
      };

      storage.update(toItemString(itemId), serializable).subscribe();

      const itemSubject = new ReplaySubject<Item|null>(2);
      collection.get(itemId).subscribe(itemSubject);

      collection.delete(itemId).subscribe();

      assert(itemSubject.pipe(map(item => !!item))).to.emitSequence([true, false]);
    });
  });

  test('get', () => {
    should(`emit the correct item`, () => {
      const itemId = parseId('lo_itemId') as LocalItemId;
      const itemName = `Test Item`;
      const serializable = {
        contentIds: [],
        id: itemId as LocalItemId,
        isEditable: true,
        name: itemName,
        type: ItemType.FOLDER,
      };

      storage.update(toItemString(itemId), serializable).subscribe();

      const metadataSubject = createSpySubject<Item|null>();
      collection.get(itemId).subscribe(metadataSubject);

      const serializableMetadataObs = metadataSubject
          .pipe(
              filterNonNull(),
              map(({serializable}) => serializable),
          );

      assert(serializableMetadataObs).to.emitWith(
          match.anyObjectThat<SerializableItem>().haveProperties({
            id: match.anyObjectThat().haveProperties(itemId),
            isEditable: true,
            name: itemName,
            type: ItemType.FOLDER,
          }),
      );
    });

    should(`emit null if the folder does not exist`, () => {
      const itemId = parseId('lo_itemId') as LocalItemId;

      const subject = createSpySubject<Item|null>();
      collection.get(itemId).subscribe(subject);

      assert(subject).to.emitWith(null);
    });
  });

  test('setMetadata', () => {
    should(`update the metadata correctly`, () => {
      const id = parseId('lo_id') as LocalItemId;
      const metadataSubject = new ReplaySubject<string|null>(2);
      collection.get(id)
          .pipe(
              map(metadata => {
                if (!metadata) {
                  return null;
                }

                return toItemString(metadata.id);
              }),
          )
          .subscribe(metadataSubject);

      storage
          .update(
              toItemString(id),
              {
                contentIds: [],
                id: id as LocalItemId,
                isEditable: true,
                name: 'name',
                type: ItemType.FOLDER,
              },
          )
          .subscribe();

      assert(metadataSubject).to.emitSequence([null, toItemString(id)]);
    });
  });
});
