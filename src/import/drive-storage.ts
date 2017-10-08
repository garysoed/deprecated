import { ImmutableSet } from 'external/gs_tools/src/immutable';
import { GapiLibrary } from 'external/gs_tools/src/net';
import { Storage } from 'external/gs_tools/src/store';

import { drive } from '../api/drive';

export type DriveFolder = {
  id: string,
  name: string,
};

export class DriveStorageImpl implements Storage<DriveFolder> {
  constructor(private readonly driveLibrary_: GapiLibrary<goog.Drive>) { }

  has(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async list(): Promise<ImmutableSet<DriveFolder>> {
    const drive = await this.driveLibrary_.get();
    const response = await drive.files.list({
      corpus: 'user',
      includeTeamDriveItems: true,
      pageSize: 30,
      q: `mimeType='application/vnd.google-apps.folder'`,
      supportsTeamDrives: true,
    });
    return ImmutableSet.of(response.result.files);
  }

  async listIds(): Promise<ImmutableSet<string>> {
    return (await this.list()).mapItem((folder: DriveFolder) => folder.id);
  }

  read(): Promise<DriveFolder | null> {
    throw new Error('Method not implemented.');
  }
}

export const DriveStorage = new DriveStorageImpl(drive);
