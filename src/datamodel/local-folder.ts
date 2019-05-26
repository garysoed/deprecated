import { generateImmutable, Immutable } from '@gs-tools/immutable';
import { SerializableLocalFolder } from '../serializable/serializable-local-folder';
import { ItemSpec } from './item';
import { ItemId } from './item-id';

class LocalFolderSpec extends ItemSpec {
  constructor(private readonly serializableLocalFolder: SerializableLocalFolder) {
    super(serializableLocalFolder);
  }

  get contentIds(): ItemId[] {
    return this.serializableLocalFolder.contentIds.map(id => new ItemId(id));
  }
  set contentIds(contentIds: ItemId[]) {
    this.serializableLocalFolder.contentIds = contentIds.map(id => id.serializable);
  }
}

export const localFolderFactory = generateImmutable(LocalFolderSpec);
export type LocalFolder = Immutable<LocalFolderSpec, SerializableLocalFolder>;
