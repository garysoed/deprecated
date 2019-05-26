import { Errors } from '@gs-tools/error';
import { SerializableItem } from '../serializable/serializable-item';
import { ItemId } from './item-id';
import { ItemType } from './item-type';
import { SourceType } from './source-type';

export class Item {
  constructor(private readonly serializableItem: SerializableItem) { }

  get id(): ItemId {
    return new ItemId(this.serializableItem.id);
  }

  get isEditable(): boolean {
    return this.serializableItem.isEditable;
  }

  get name(): string {
    return this.serializableItem.name;
  }

  get serializable(): SerializableItem {
    return {...this.serializableItem};
  }

  get type(): ItemType {
    return this.serializableItem.type;
  }

  update(updater: ItemUpdater): Item {
    return new Item({
      ...this.serializableItem,
      ...updater.changeSerializable,
    });
  }

  get set(): ItemUpdater {
    return new ItemUpdater();
  }
}

type MutablePartial<T> = {-readonly [K in keyof T]+?: T[K]};

export class ItemUpdater {
  protected readonly itemChangeSerializable: MutablePartial<SerializableItem> = {};

  get changeSerializable(): MutablePartial<SerializableItem> {
    return this.itemChangeSerializable;
  }

  name(newName: string): this {
    this.itemChangeSerializable.name = newName;

    return this;
  }
}

export function createFromDrive(drive: gapi.client.drive.File): Item {
  if (!drive.id) {
    throw Errors.assert('drive.id').shouldExist().butNot();
  }

  return new Item({
    id: {id: drive.id, source: SourceType.DRIVE},
    isEditable: false,
    name: drive.name || '',
    type: getTypeFromDrive(drive),
  });
}

export function getTypeFromDrive(drive: gapi.client.drive.File): ItemType {
  switch (drive.mimeType) {
    case 'application/vnd.google-apps.folder':
      return ItemType.FOLDER;
    case 'application/x-javascript':
      return ItemType.CONVERTER;
    default:
      return ItemType.UNKNOWN;
  }
}
