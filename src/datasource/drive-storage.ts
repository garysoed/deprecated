import {
  ExponentialBackoffRetryStrategy,
  LimitedCountRetryStrategy,
  Promises,
  RetryStrategies } from 'external/gs_tools/src/async';
import { ImmutableList, ImmutableSet } from 'external/gs_tools/src/immutable';
import { GapiLibrary } from 'external/gs_tools/src/net';
import { Paths } from 'external/gs_tools/src/path';
import { GapiRequestQueue, GapiStorage } from 'external/gs_tools/src/store';

import { drive } from '../api';
import { ApiFile, ApiFileSummary, ApiFileType } from '../datasource/drive';
import { DriveSource } from '../datasource/drive-source';

type ListQueryConfig = {
  filename?: string,
  mimeTypes?: string[],
  parentId?: string,
};

export const DRIVE_FOLDER_MIMETYPE = 'application/vnd.google-apps.folder';
const TYPE_MAPPING = new Map([
  [DRIVE_FOLDER_MIMETYPE, ApiFileType.FOLDER],
  ['application/json', ApiFileType.METADATA],
  ['application/x-javascript', ApiFileType.PROCESSOR],
  ['text/tab-separated-values', ApiFileType.TSV],
  ['text/x-markdown', ApiFileType.MARKDOWN],
]);

const GET_RETRY_STRATEGY = RetryStrategies.all([
  new ExponentialBackoffRetryStrategy(500),
  new LimitedCountRetryStrategy(5),
]);

export function convertToType_(driveType: string, filename: string): ApiFileType {
  const type = TYPE_MAPPING.get(driveType);
  if (type) {
    return type;
  }

  const extension = Paths.getFilenameParts(filename).extension;
  if (extension === 'yml') {
    return ApiFileType.METADATA;
  }

  if (extension === 'hbs') {
    return ApiFileType.TEMPLATE;
  }

  return ApiFileType.UNKNOWN;
}

export function convertToFileSummary_(file: goog.drive.files.File): ApiFileSummary<DriveSource> {
  return {
    name: file.name,
    source: DriveSource.newInstance(file.id),
    type: convertToType_(file.mimeType, file.name),
  };
}

export class DriveStorageImpl extends GapiStorage<
    goog.Drive,
    goog.drive.files.File,
    goog.drive.files.ListResponse,
    goog.drive.files.ListResponse,
    goog.drive.files.File,
    ApiFile<DriveSource>,
    ApiFileSummary<DriveSource>> {
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
    return (await this.listImpl_(queueRequest)).mapItem((item) => item.source.getId());
  }

  protected async listImpl_(
      queueRequest: GapiRequestQueue<goog.Drive, goog.drive.files.ListResponse>):
      Promise<ImmutableSet<ApiFileSummary<DriveSource>>> {
    const response = await queueRequest((api) => api.files.list(this.createListConfig_({
      mimeTypes: [DRIVE_FOLDER_MIMETYPE],
    })));
    const files = response.files.map((file) => convertToFileSummary_(file));
    return ImmutableSet.of(files);
  }

  private async readFileContent_(summary: ApiFileSummary<DriveSource>): Promise<string | null> {
    const fileType = summary.type;
    if (fileType === ApiFileType.UNKNOWN) {
      return null;
    }

    if (fileType === ApiFileType.FOLDER) {
      return null;
    }

    const drive = await this.driveLibrary.get();

    switch (fileType) {
      case ApiFileType.MARKDOWN:
      case ApiFileType.METADATA:
      case ApiFileType.PROCESSOR:
      case ApiFileType.TEMPLATE:
      case ApiFileType.TSV:
        const getResponse = await Promises.withRetry(
            () => drive.files.get({alt: 'media', fileId: summary.source.getId()}),
            GET_RETRY_STRATEGY);
        return getResponse.body;
    }
  }

  private async readFolderContents_(folderId: string): Promise<ApiFile<DriveSource>[]> {
    const drive = await this.driveLibrary.get();

    // Get the contents.
    const response = await drive.files.list(this.createListConfig_({
      parentId: folderId,
    }));

    const contents = await Promise.all(response.result.files.map((file) => this.read(file.id)));
    return contents.filter((content) => !!content) as ApiFile<DriveSource>[];
  }

  protected async readImpl_(
      queueRequest: GapiRequestQueue<goog.Drive, goog.drive.files.File>,
      id: string): Promise<ApiFile<DriveSource>> {
    const getResponse = await queueRequest((drive) => drive.files.get({fileId: id}));
    const summary = convertToFileSummary_(getResponse);
    switch (summary.type) {
      case ApiFileType.FOLDER:
        return {
          files: await this.readFolderContents_(summary.source.getId()),
          summary,
        };
      case ApiFileType.MARKDOWN:
      case ApiFileType.METADATA:
      case ApiFileType.PROCESSOR:
      case ApiFileType.TEMPLATE:
      case ApiFileType.TSV:
        return {
          content: await this.readFileContent_(summary) || undefined,
          files: [],
          summary,
        };
      case ApiFileType.UNKNOWN:
        return {
          files: [],
          summary,
        };
    }
  }

  async search(filename: string): Promise<ImmutableList<ApiFileSummary<DriveSource>>> {
    const drive = await this.driveLibrary.get();
    const response = await drive.files.list(this.createListConfig_({
      filename,
      mimeTypes: [DRIVE_FOLDER_MIMETYPE],
    }));
    return ImmutableList.of(response.result.files.map((file) => convertToFileSummary_(file)));
  }
}

export const DriveStorage = new DriveStorageImpl(drive);
