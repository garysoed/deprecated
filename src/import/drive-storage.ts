import { ImmutableList, ImmutableSet } from 'external/gs_tools/src/immutable';
import { GapiLibrary } from 'external/gs_tools/src/net';
import { Storage } from 'external/gs_tools/src/store';

import { drive } from '../api/drive';
import { DriveFile, DriveFileSummary, DriveType } from '../import/drive';

type ListQueryConfig = {
  filename?: string,
  mimeTypes?: string[],
  parentId?: string,
};

export const DRIVE_FOLDER_MIMETYPE = 'application/vnd.google-apps.folder';
const TYPE_MAPPING = new Map([
  [DRIVE_FOLDER_MIMETYPE, DriveType.FOLDER],
  ['text/x-markdown', DriveType.MARKDOWN],
]);

export function convertToType_(driveType: string): DriveType {
  return TYPE_MAPPING.get(driveType) || DriveType.UNKNOWN;
}

export function convertToFileSummary_(file: goog.drive.files.File): DriveFileSummary {
  return {
    id: file.id,
    name: file.name,
    type: convertToType_(file.mimeType),
  };
}

export class DriveStorageImpl implements Storage<DriveFile, DriveFileSummary> {
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

  async list(): Promise<ImmutableSet<DriveFileSummary>> {
    const drive = await this.driveLibrary_.get();
    const response = await drive.files.list(this.createListConfig_({
      mimeTypes: [DRIVE_FOLDER_MIMETYPE],
    }));
    const files = response.result.files.map((file) => convertToFileSummary_(file));
    return ImmutableSet.of(files);
  }

  async listIds(): Promise<ImmutableSet<string>> {
    return (await this.list()).mapItem((folder: DriveFileSummary) => folder.id);
  }

  async read(id: string): Promise<DriveFile> {
    const drive = await this.driveLibrary_.get();
    const getResponse = await drive.files.get({fileId: id});
    const summary = convertToFileSummary_(getResponse.result);
    switch (summary.type) {
      case DriveType.FOLDER:
        return {
          files: await this.readFolderContents_(summary.id),
          summary,
        };
      case DriveType.MARKDOWN:
        return {
          content: await this.readFileContent_(summary) || undefined,
          files: [],
          summary,
        };
      case DriveType.UNKNOWN:
        return {
          files: [],
          summary,
        };
    }
  }

  private async readFileContent_(summary: DriveFileSummary): Promise<string | null> {
    if (summary.type === DriveType.UNKNOWN) {
      return null;
    }

    if (summary.type === DriveType.FOLDER) {
      return null;
    }

    const drive = await this.driveLibrary_.get();
    const response = await drive.files.get({alt: 'media', fileId: summary.id});
    return response.body;
  }

  private async readFolderContents_(folderId: string): Promise<DriveFile[]> {
    const drive = await this.driveLibrary_.get();

    // Get the contents.
    const response = await drive.files.list(this.createListConfig_({
      parentId: folderId,
    }));

    return Promise.all(response.result.files.map((file) => this.read(file.id)));
  }

  async search(filename: string): Promise<ImmutableList<DriveFileSummary>> {
    const drive = await this.driveLibrary_.get();
    const response = await drive.files.list(this.createListConfig_({
      filename,
      mimeTypes: [DRIVE_FOLDER_MIMETYPE],
    }));
    return ImmutableList.of(response.result.files.map((file) => convertToFileSummary_(file)));
  }
}

export const DriveStorage = new DriveStorageImpl(drive);
window['$drive'] = DriveStorage;
