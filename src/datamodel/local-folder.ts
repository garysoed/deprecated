import { generateImmutable, Immutable } from '@gs-tools/immutable';
import { ItemId } from '../serializable/item-id';
import { SerializableLocalFolder } from '../serializable/serializable-local-folder';
import { ItemSpec } from './item';

class LocalFolderSpec extends ItemSpec {
  constructor(private readonly serializableLocalFolder: SerializableLocalFolder) {
    super(serializableLocalFolder);
  }

  get contentIds(): ItemId[] {
    return [...this.serializableLocalFolder.contentIds];
  }
  set contentIds(contentIds: ItemId[]) {
    this.serializableLocalFolder.contentIds = [...contentIds];
  }
}

export const localFolderFactory = generateImmutable(LocalFolderSpec);
export type LocalFolder = Immutable<LocalFolderSpec, SerializableLocalFolder>;
