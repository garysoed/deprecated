import { DriveSource } from '../datasource/drive-source';

// TODO: Rename to remove Drive.
// TODO: This should be MARKDOWN, METADATA, UNKNOWN, FOLDER.
export enum ApiDriveType {
  UNKNOWN,
  FOLDER,
  YAML,
  MARKDOWN,
}

// TODO: source should be generic type.
export type ApiDriveFileSummary = {
  name: string,
  source: DriveSource,
  type: ApiDriveType,
};

// TODO: should have generic type of source.
export type ApiDriveFile = {
  content?: string,
  files: ApiDriveFile[],
  summary: ApiDriveFileSummary,
};
