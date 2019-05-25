import { SerializableLocalFolder } from 'src/serializable/serializable-local-folder';
import { ItemId } from './item-id';
import { Item } from './item';

export class LocalFolder extends Item {
  constructor(private readonly serializableLocalFolder: SerializableLocalFolder) {
    super(serializableLocalFolder);
  }

  get contentIds(): ItemId[] {
    return this.serializableLocalFolder.contentIds.map(id => new ItemId(id));
  }
}
