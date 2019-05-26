import { SerializableLocalFolder } from '../serializable/serializable-local-folder';
import { Item, ItemUpdater } from './item';
import { ItemId } from './item-id';

export class LocalFolder extends Item {
  constructor(private readonly serializableLocalFolder: SerializableLocalFolder) {
    super(serializableLocalFolder);
  }

  get contentIds(): ItemId[] {
    return this.serializableLocalFolder.contentIds.map(id => new ItemId(id));
  }

  update(updater: LocalFolderUpdater): LocalFolder {
    return new LocalFolder({
      ...this.serializableLocalFolder,
      ...updater.changeSerializable,
    });
  }

  get set(): LocalFolderUpdater {
    return new LocalFolderUpdater();
  }
}

type MutablePartial<T> = {-readonly [K in keyof T]+?: T[K]};

export class LocalFolderUpdater extends ItemUpdater {
  protected readonly localFolderChangeSerializable: MutablePartial<SerializableLocalFolder> = {};

  get changeSerializable(): MutablePartial<SerializableLocalFolder> {
    return {
      ...this.itemChangeSerializable,
      ...this.localFolderChangeSerializable,
    };
  }

  contentIds(contentIds: ItemId[]): this {
    this.localFolderChangeSerializable.contentIds = contentIds.map(id => id.serializable);

    return this;
  }
}
