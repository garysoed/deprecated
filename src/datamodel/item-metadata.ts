import { Errors } from '@gs-tools/error';
import { SerializableItem } from '../serializable/serializable-item';
import { ItemId } from './item-id';
import { ItemType } from './item-type';
import { SourceType } from './source-type';

export class ItemMetadata {
  constructor(readonly serializable: SerializableItem) {
  }

  get id(): ItemId {
    return new ItemId(this.serializable.id);
  }

  get isEditable(): boolean {
    return this.serializable.isEditable;
  }

  get name(): string {
    return this.serializable.name;
  }

  setName(newName: string): ItemMetadata {
    return new ItemMetadata({
      ...this.serializable,
      name: newName,
    });
  }

  get type(): ItemType {
    return this.serializable.type;
  }
}

export function createFromDrive(drive: gapi.client.drive.File): ItemMetadata {
  if (!drive.id) {
    throw Errors.assert('drive.id').shouldExist().butNot();
  }

  return new ItemMetadata({
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
