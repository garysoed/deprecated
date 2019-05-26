import { assert, createSpySubject, match, setup, should, test } from '@gs-testing';
import { SimpleIdGenerator } from '@gs-tools/random';
import { filterNonNull } from '@gs-tools/rxjs';
import { EditableStorage, InMemoryStorage } from '@gs-tools/store';
import { ReplaySubject } from '@rxjs';
import { map, shareReplay, switchMap, take } from '@rxjs/operators';
import { SerializableItem } from '../serializable/serializable-item';
import { Item } from './item';
import { ItemMetadataCollection } from './item-collection';
import { parseId } from './item-id';
import { ItemType } from './item-type';

test('@thoth/datamodel/item-metadata-collection', () => {
  let storage: EditableStorage<SerializableItem>;
  let collection: ItemMetadataCollection;

  setup(() => {
    storage = new InMemoryStorage(new SimpleIdGenerator());
    collection = new ItemMetadataCollection(storage);
  });

  test('deleteMetadata', () => {
    should(`delete the metadata correctly`, () => {
      const itemId = parseId('lo_itemId');
      const itemName = `Test Item`;
      const metadataSerializable = {
        id: itemId.serializable,
        isEditable: true,
        name: itemName,
        type: ItemType.FOLDER,
      };

      storage.update(itemId.toString(), metadataSerializable).subscribe();

      const itemSubject = new ReplaySubject<Item|null>(2);
      collection.getMetadata(itemId).subscribe(itemSubject);

      collection.deleteMetadata(itemId).subscribe();

      assert(itemSubject.pipe(map(item => !!item))).to.emitSequence([
        true,
        false,
      ]);
    });
  });

  test('getMetadata', () => {
    should(`emit the correct metadata`, () => {
      const itemId = parseId('lo_itemId');
      const itemName = `Test Item`;
      const metadataSerializable = {
        id: itemId.serializable,
        isEditable: true,
        name: itemName,
        type: ItemType.FOLDER,
      };

      storage.update(itemId.toString(), metadataSerializable).subscribe();

      const metadataSubject = createSpySubject<Item|null>();
      collection.getMetadata(itemId).subscribe(metadataSubject);

      const serializableMetadataObs = metadataSubject
          .pipe(
              filterNonNull(),
              map(({serializable}) => serializable),
          );

      assert(serializableMetadataObs).to.emitWith(
          match.anyObjectThat<SerializableItem>().haveProperties({
            id: match.anyObjectThat().haveProperties(itemId.serializable),
            isEditable: true,
            name: itemName,
            type: ItemType.FOLDER,
          }),
      );
    });

    should(`emit null if the metadata does not exist`, () => {
      const itemId = parseId('lo_itemId');

      const metadataSubject = createSpySubject<Item|null>();
      collection.getMetadata(itemId).subscribe(metadataSubject);

      assert(metadataSubject).to.emitWith(null);
    });
  });

  test('newMetadata', () => {
    should(`emit a new metadata that does not exist`, () => {
      const metadataId1 = parseId('lo_metadataId1');
      const metadataId2 = parseId('lo_metadataId2');
      const metadataId3 = parseId('lo_metadataId3');

      storage
          .update(
              metadataId1.toString(),
              {
                id: metadataId1.serializable,
                isEditable: true,
                name: 'name',
                type: ItemType.FOLDER,
              },
          )
          .subscribe();
      storage
          .update(
              metadataId2.toString(),
              {
                id: metadataId2.serializable,
                isEditable: true,
                name: 'name',
                type: ItemType.FOLDER,
              },
          )
          .subscribe();
      storage
          .update(
              metadataId3.toString(),
              {
                id: metadataId3.serializable,
                isEditable: true,
                name: 'name',
                type: ItemType.FOLDER,
              },
          )
          .subscribe();

      const newMetadataObs = collection.newLocalFolderMetadata()
          .pipe(take(1), shareReplay(1));

      assert(newMetadataObs.pipe(map(({isEditable}) => isEditable))).to.emitWith(true);

      const storedNewMetadata = newMetadataObs
          .pipe(switchMap(newMetadata => collection.getMetadata(newMetadata.id)));
      assert(storedNewMetadata).to.emitWith(null);
    });
  });

  test('setMetadata', () => {
    should(`update the metadata correctly`, () => {
      const id = parseId('lo_id');
      const metadataSubject = new ReplaySubject<string|null>(2);
      collection.getMetadata(id)
          .pipe(
              map(metadata => {
                if (!metadata) {
                  return null;
                }

                return metadata.id.toString();
              }),
          )
          .subscribe(metadataSubject);

      storage
          .update(
              id.toString(),
              {
                id: id.serializable,
                isEditable: true,
                name: 'name',
                type: ItemType.FOLDER,
              },
          )
          .subscribe();

      assert(metadataSubject).to.emitSequence([null, id.toString()]);
    });
  });
});
