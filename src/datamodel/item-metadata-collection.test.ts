import { assert, createSpySubject, match, setup, should, test } from '@gs-testing';
import { SimpleIdGenerator } from '@gs-tools/random';
import { filterNonNull } from '@gs-tools/rxjs';
import { EditableStorage, InMemoryStorage } from '@gs-tools/store';
import { ReplaySubject } from '@rxjs';
import { map, shareReplay, switchMap, take } from '@rxjs/operators';
import { SerializableItemMetadata } from '../serializable/serializable-item-metadata';
import { SerializableSource } from '../serializable/serializable-source';
import { ItemMetadata } from './item-metadata';
import { ItemMetadataCollection } from './item-metadata-collection';
import { ItemType } from './item-type';
import { SourceType } from './source-type';
import { LocalSource } from './source/local-source';

test('@thoth/datamodel/item-metadata-collection', () => {
  let storage: EditableStorage<SerializableItemMetadata>;
  let collection: ItemMetadataCollection;

  setup(() => {
    storage = new InMemoryStorage(new SimpleIdGenerator());
    collection = new ItemMetadataCollection(storage);
  });

  test('deleteMetadata', () => {
    should(`delete the metadata correctly`, async () => {
      const itemId = 'itemId';
      const itemName = `Test Item`;
      const metadataSerializable = {
        id: itemId,
        isEditable: true,
        name: itemName,
        source: {type: SourceType.LOCAL},
        type: ItemType.FOLDER,
      };

      storage.update(itemId, metadataSerializable).subscribe();

      const metadataSubject = new ReplaySubject<ItemMetadata|null>(2);
      collection.getMetadata(itemId).subscribe(metadataSubject);

      collection.deleteMetadata(itemId).subscribe();

      await assert(metadataSubject).to.emitSequence([
        match.anyObjectThat<ItemMetadata>().beAnInstanceOf(ItemMetadata),
        null,
      ]);
    });
  });

  test('getMetadata', () => {
    should(`emit the correct metadata`, async () => {
      const itemId = 'itemId';
      const itemName = `Test Item`;
      const metadataSerializable = {
        id: itemId,
        isEditable: true,
        name: itemName,
        source: {type: SourceType.LOCAL},
        type: ItemType.FOLDER,
      };

      storage.update(itemId, metadataSerializable).subscribe();

      const metadataSubject = createSpySubject<ItemMetadata|null>();
      collection.getMetadata(itemId).subscribe(metadataSubject);

      const serializableMetadataObs = metadataSubject
          .pipe(
              filterNonNull(),
              map(({serializable}) => serializable),
          );

      await assert(serializableMetadataObs).to.emitWith(
          match.anyObjectThat<SerializableItemMetadata>().haveProperties({
            id: itemId,
            isEditable: true,
            name: itemName,
            source: match.anyObjectThat<SerializableSource>().haveProperties({
              type: SourceType.LOCAL,
            }),
          }),
      );
    });

    should(`emit null if the metadata does not exist`, async () => {
      const itemId = 'itemId';

      const metadataSubject = createSpySubject<ItemMetadata|null>();
      collection.getMetadata(itemId).subscribe(metadataSubject);

      await assert(metadataSubject).to.emitWith(null);
    });
  });

  test('newMetadata', () => {
    should(`emit a new metadata that does not exist`, async () => {
      const metadataId1 = 'metadataId1';
      const metadataId2 = 'metadataId2';
      const metadataId3 = 'metadataId3';

      const serializableSource = {type: SourceType.LOCAL};
      storage
          .update(
              metadataId1,
              {
                id: metadataId1,
                isEditable: true,
                name: 'name',
                source: serializableSource,
                type: ItemType.FOLDER,
              },
          )
          .subscribe();
      storage
          .update(
              metadataId2,
              {
                id: metadataId2,
                isEditable: true,
                name: 'name',
                source: serializableSource,
                type: ItemType.FOLDER,
              },
          )
          .subscribe();
      storage
          .update(
              metadataId3,
              {
                id: metadataId3,
                isEditable: true,
                name: 'name',
                source: serializableSource,
                type: ItemType.FOLDER,
              },
          )
          .subscribe();

      const source = new LocalSource(serializableSource);
      const newMetadataObs = collection.newLocalFolderMetadata(false, source)
          .pipe(take(1), shareReplay(1));

      await assert(newMetadataObs.pipe(map(({isEditable}) => isEditable))).to.emitWith(false);

      const storedNewMetadata = newMetadataObs
          .pipe(switchMap(newMetadata => collection.getMetadata(newMetadata.id)));
      await assert(storedNewMetadata).to.emitWith(null);
    });
  });

  test('setMetadata', () => {
    should(`update the metadata correctly`, async () => {
      const id = 'id';
      const metadataSubject = new ReplaySubject<ItemMetadata|null>(2);
      collection.getMetadata(id).subscribe(metadataSubject);

      storage
          .update(
              id,
              {
                id,
                isEditable: true,
                name: 'name',
                source: {type: SourceType.LOCAL},
                type: ItemType.FOLDER,
              },
          )
          .subscribe();

      await assert(metadataSubject).to.emitSequence([
        null,
        match.anyObjectThat<ItemMetadata>().haveProperties({id}),
      ]);
    });
  });
});
