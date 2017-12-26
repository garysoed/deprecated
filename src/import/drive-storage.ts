import { ImmutableList, ImmutableSet } from 'external/gs_tools/src/immutable';
import { GapiLibrary } from 'external/gs_tools/src/net';
import { GapiRequestQueue, GapiStorage } from 'external/gs_tools/src/store';

import { drive } from '../api';
import { ApiDriveFile, ApiDriveFileSummary, ApiDriveType } from '../import/drive';

type ListQueryConfig = {
  filename?: string,
  mimeTypes?: string[],
  parentId?: string,
};

export const DRIVE_FOLDER_MIMETYPE = 'application/vnd.google-apps.folder';
const TYPE_MAPPING = new Map([
  [DRIVE_FOLDER_MIMETYPE, ApiDriveType.FOLDER],
  ['application/json', ApiDriveType.YAML],
  ['text/x-markdown', ApiDriveType.MARKDOWN],
]);

export function convertToType_(driveType: string): ApiDriveType {
  return TYPE_MAPPING.get(driveType) || ApiDriveType.UNKNOWN;
}

export function convertToFileSummary_(file: goog.drive.files.File): ApiDriveFileSummary {
  return {
    id: file.id,
    name: file.name,
    type: convertToType_(file.mimeType),
  };
}

export class DriveStorageImpl extends GapiStorage<
    goog.Drive,
    goog.drive.files.File,
    goog.drive.files.ListResponse,
    goog.drive.files.ListResponse,
    goog.drive.files.File,
    ApiDriveFile,
    ApiDriveFileSummary> {
  constructor(private readonly driveLibrary: GapiLibrary<goog.Drive>) {
    super(driveLibrary);
  }

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

  async hasImpl_(queueRequest: GapiRequestQueue<goog.Drive, goog.drive.files.File>, id: string):
      Promise<boolean> {
    return (await this.readImpl_(queueRequest, id)) !== null;
  }

  protected async listIdsImpl_(
      queueRequest: GapiRequestQueue<goog.Drive, goog.drive.files.ListResponse>):
      Promise<ImmutableSet<string>> {
    return (await this.listImpl_(queueRequest)).mapItem((item) => item.id);
  }

  protected async listImpl_(
      queueRequest: GapiRequestQueue<goog.Drive, goog.drive.files.ListResponse>):
      Promise<ImmutableSet<ApiDriveFileSummary>> {
    const response = await queueRequest((api) => api.files.list(this.createListConfig_({
      mimeTypes: [DRIVE_FOLDER_MIMETYPE],
    })));
    const files = response.files.map((file) => convertToFileSummary_(file));
    return ImmutableSet.of(files);
  }

  private async readFileContent_(summary: ApiDriveFileSummary): Promise<string | null> {
    if (summary.type === ApiDriveType.UNKNOWN) {
      return null;
    }

    if (summary.type === ApiDriveType.FOLDER) {
      return null;
    }

    const drive = await this.driveLibrary.get();
    const response = await drive.files.get({alt: 'media', fileId: summary.id});
    return response.body;
  }

  private async readFolderContents_(folderId: string): Promise<ApiDriveFile[]> {
    const drive = await this.driveLibrary.get();

    // Get the contents.
    const response = await drive.files.list(this.createListConfig_({
      parentId: folderId,
    }));

    const contents = await Promise.all(response.result.files.map((file) => this.read(file.id)));
    return contents.filter((content) => !!content) as ApiDriveFile[];
  }

  protected async readImpl_(
      queueRequest: GapiRequestQueue<goog.Drive, goog.drive.files.File>,
      id: string): Promise<ApiDriveFile> {
    const getResponse = await queueRequest((drive) => drive.files.get({fileId: id}));
    const summary = convertToFileSummary_(getResponse);
    switch (summary.type) {
      case ApiDriveType.FOLDER:
        return {
          files: await this.readFolderContents_(summary.id),
          summary,
        };
      case ApiDriveType.MARKDOWN:
      case ApiDriveType.YAML:
        return {
          content: await this.readFileContent_(summary) || undefined,
          files: [],
          summary,
        };
      case ApiDriveType.UNKNOWN:
        return {
          files: [],
          summary,
        };
    }
  }

  async search(filename: string): Promise<ImmutableList<ApiDriveFileSummary>> {
    const drive = await this.driveLibrary.get();
    const response = await drive.files.list(this.createListConfig_({
      filename,
      mimeTypes: [DRIVE_FOLDER_MIMETYPE],
    }));
    return ImmutableList.of(response.result.files.map((file) => convertToFileSummary_(file)));
  }
}

export const DriveStorage = new DriveStorageImpl(drive);
window['$drive'] = DriveStorage;
