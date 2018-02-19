import { DriveSource } from '../datasource/drive-source';

export enum ApiDriveType {
  UNKNOWN,
  FOLDER,
  YAML,
  MARKDOWN,
}

export type ApiDriveFileSummary = {
  name: string,
  source: DriveSource,
  type: ApiDriveType,
};

export type ApiDriveFile = {
  content?: string,
  files: ApiDriveFile[],
  summary: ApiDriveFileSummary,
};
