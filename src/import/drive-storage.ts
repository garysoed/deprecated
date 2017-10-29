import { ImmutableList, ImmutableSet } from 'external/gs_tools/src/immutable';
import { GapiLibrary } from 'external/gs_tools/src/net';
import { Storage } from 'external/gs_tools/src/store';

import { drive } from '../api/drive';

export type ApiDriveFolder = {
  id: string,
  name: string,
};

export class DriveStorageImpl implements Storage<ApiDriveFolder> {
  constructor(private readonly driveLibrary_: GapiLibrary<goog.Drive>) { }

  private createListConfig_(filename: string = ''): goog.drive.ListConfig {
    const queries = [`mimeType = 'application/vnd.google-apps.folder'`];
    if (filename) {
      queries.push(`name contains '${filename}'`);
    }

    return {
      corpus: 'user',
      includeTeamDriveItems: true,
      pageSize: 30,
      q: queries.join(' and '),
      supportsTeamDrives: true,
    };
  }

  has(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async list(): Promise<ImmutableSet<ApiDriveFolder>> {
    const drive = await this.driveLibrary_.get();
    const response = await drive.files.list(this.createListConfig_());
    return ImmutableSet.of(response.result.files);
  }

  async listIds(): Promise<ImmutableSet<string>> {
    return (await this.list()).mapItem((folder: ApiDriveFolder) => folder.id);
  }

  read(): Promise<ApiDriveFolder | null> {
    throw new Error('Method not implemented.');
  }

  async search(filename: string): Promise<ImmutableList<ApiDriveFolder>> {
    const drive = await this.driveLibrary_.get();
    const response = await drive.files.list(this.createListConfig_(filename));
    return ImmutableList.of(response.result.files);
  }
}

export const DriveStorage = new DriveStorageImpl(drive);
