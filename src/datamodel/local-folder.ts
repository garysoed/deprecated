import { SerializableLocalFolder } from 'src/serializable/serializable-local-folder';
import { ItemId } from './item-id';
import { ItemMetadata } from './item-metadata';

export class LocalFolder extends ItemMetadata {
  constructor(private readonly serializableLocalFolder: SerializableLocalFolder) {
    super(serializableLocalFolder);
  }

  get contentIds(): ItemId[] {
    return this.serializableLocalFolder.contentIds.map(id => new ItemId(id));
  }
}
