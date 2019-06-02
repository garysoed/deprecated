import { GapiHandler } from '@gs-tools/gapi';
import { _v } from '@mask';
import { from, Observable } from '@rxjs';
import { map, switchMap } from '@rxjs/operators';
import { ItemType } from '../datamodel/item-type';
import { SourceType } from '../datamodel/source-type';
import { SerializableDriveFile } from '../serializable/serializable-drive-file';
import { $gapiClient as $gapiClient } from './gapi-client';

class DriveClient {
  constructor(private readonly handler: GapiHandler) {}

  find(q: string): Observable<SerializableDriveFile[]> {
    return this.handler.ensureSignedIn()
        .pipe(
            switchMap(() => from(gapi.client.drive.files.list({q}))),
            map(result => result.result.files || []),
            map(files => files.map(toSerializableDriveFile)),
        );
  }

  get(fileId: string): Observable<SerializableDriveFile|null> {
    return this.handler.ensureSignedIn()
        .pipe(
            switchMap(() => from(gapi.client.drive.files.get({fileId}))),
            map(result => toSerializableDriveFile(result.result)),
        );
  }
}

export const $driveClient = _v.stream(
    vine => $gapiClient.get(vine).pipe(map(gapiHandler => new DriveClient(gapiHandler))),
    globalThis,
);

function toSerializableDriveFile(drive: gapi.client.drive.File): SerializableDriveFile {
  if (!drive.id) {
    throw new Error('Drive ID not found');
  }

  return {
    id: {id: drive.id || '', source: SourceType.DRIVE},
    isEditable: false,
    name: drive.name || '',
    type: getTypeFromDrive(drive),
  };
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
