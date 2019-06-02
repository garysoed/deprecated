import { generateImmutable, Immutable } from '@gs-tools/immutable';
import { BaseItemId, LocalItemId } from '../serializable/item-id';
import { SerializableLocalFolder } from '../serializable/serializable-local-folder';
import { ItemSpec } from './item';

class LocalFolderSpec extends ItemSpec {
  constructor(private readonly serializableLocalFolder: SerializableLocalFolder) {
    super(serializableLocalFolder);
  }

  get id(): LocalItemId {
    return {...this.serializableLocalFolder.id};
  }

  get contentIds(): BaseItemId[] {
    return [...this.serializableLocalFolder.contentIds];
  }
  set contentIds(contentIds: BaseItemId[]) {
    this.serializableLocalFolder.contentIds = [...contentIds];
  }
}

export const localFolderFactory = generateImmutable(LocalFolderSpec);
export type LocalFolder = Immutable<LocalFolderSpec, SerializableLocalFolder>;
