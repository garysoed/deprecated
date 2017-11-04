export enum ApiDriveType {
  UNKNOWN,
  FOLDER,
  MARKDOWN,
}

export type ApiDriveFileSummary = {
  id: string,
  name: string,
  type: ApiDriveType,
};

export type ApiDriveFile = {
  content?: string,
  files: ApiDriveFile[],
  summary: ApiDriveFileSummary,
};
