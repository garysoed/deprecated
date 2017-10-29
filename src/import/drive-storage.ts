import { ImmutableList, ImmutableSet } from 'external/gs_tools/src/immutable';
import { GapiLibrary } from 'external/gs_tools/src/net';
import { Storage } from 'external/gs_tools/src/store';

import { drive } from '../api/drive';
import { DriveFolder } from '../data/drive-folder';

export type DriveFolderSummary = {
  id: string,
  name: string,
};

type ListQueryConfig = {
  filename?: string,
  mimeTypes?: string[],
  parentId?: string,
};

const DRIVE_FOLDER_MIMETYPE = 'application/vnd.google-apps.folder';

export class DriveStorageImpl implements Storage<DriveFolder, DriveFolderSummary> {
  constructor(private readonly driveLibrary_: GapiLibrary<goog.Drive>) { }

  private createListConfig_(config: ListQueryConfig = {}): goog.drive.files.ListConfig {
    const {filename, mimeTypes, parentId} = config;
    const queries: string[] = [];
    if (filename) {
      queries.push(`name contains '${filename}'`);
    }

    if (mimeTypes) {
      const mimeTypeQuery = mimeTypes
          .map((mimeType) => `mimeType contains '${mimeType}'`)
          .join(' or ');
      queries.push(`(${mimeTypeQuery})`);
    }

    if (parentId) {
      queries.push(`'${parentId}' in parents`);
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

  async list(): Promise<ImmutableSet<DriveFolderSummary>> {
    const drive = await this.driveLibrary_.get();
    const response = await drive.files.list(this.createListConfig_({
      mimeTypes: [DRIVE_FOLDER_MIMETYPE],
    }));
    return ImmutableSet.of(response.result.files);
  }

  async listIds(): Promise<ImmutableSet<string>> {
    return (await this.list()).mapItem((folder: DriveFolderSummary) => folder.id);
  }

  async read(id: string): Promise<DriveFolder | null> {
    const drive = await this.driveLibrary_.get();
    // const response = await drive.files.list(this.createListConfig_({
    //   mimeTypes: ['text/'],
    //   parentId: id,
    // }));
    const response = await drive.files.get({alt: 'media', fileId: id});
    return response.result as any;
  }

  async search(filename: string): Promise<ImmutableList<DriveFolderSummary>> {
    const drive = await this.driveLibrary_.get();
    const response = await drive.files.list(this.createListConfig_({
      filename,
      mimeTypes: [DRIVE_FOLDER_MIMETYPE],
    }));
    return ImmutableList.of(response.result.files);
  }
}

export const DriveStorage = new DriveStorageImpl(drive);
window['$drive'] = DriveStorage;
