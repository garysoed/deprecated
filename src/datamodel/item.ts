import { Errors } from '@gs-tools/error';
import { generateImmutable, Immutable } from '@gs-tools/immutable';
import { ItemId } from '../serializable/item-id';
import { SerializableItem } from '../serializable/serializable-item';
import { ItemType } from './item-type';
import { SourceType } from './source-type';

export class ItemSpec {
  constructor(private readonly serializableItem: SerializableItem) { }

  get id(): ItemId {
    return {...this.serializableItem.id};
  }

  get isEditable(): boolean {
    return this.serializableItem.isEditable;
  }

  get name(): string {
    return this.serializableItem.name;
  }
  set name(newName: string) {
    this.serializableItem.name = newName;
  }

  get type(): ItemType {
    return this.serializableItem.type;
  }
}

export const itemFactory = generateImmutable(ItemSpec);
export type Item = Immutable<ItemSpec, SerializableItem>;

export function createFromDrive(drive: gapi.client.drive.File): Item {
  if (!drive.id) {
    throw Errors.assert('drive.id').shouldExist().butNot();
  }

  return itemFactory.create({
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
