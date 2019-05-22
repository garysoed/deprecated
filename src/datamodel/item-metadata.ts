import { Errors } from '@gs-tools/error';
import { SerializableDriveSource } from 'src/serializable/serializable-source';
import { SerializableItemMetadata } from '../serializable/serializable-item-metadata';
import { ItemType } from './item-type';
import { Source } from './source';
import { createSource } from './source-factory';
import { SourceType } from './source-type';

export class ItemMetadata {
  readonly source: Source;

  constructor(readonly serializable: SerializableItemMetadata) {
    this.source = createSource(serializable.source);
  }

  get id(): string {
    return this.serializable.id;
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
    id: drive.id,
    isEditable: false,
    name: drive.name || '',
    source: {driveId: drive.id, type: SourceType.DRIVE} as SerializableDriveSource,
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
