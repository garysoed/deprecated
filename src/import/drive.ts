export enum DriveType {
  UNKNOWN,
  FOLDER,
  MARKDOWN,
}

export type DriveFileSummary = {
  id: string,
  name: string,
  type: DriveType,
};

export type DriveFile = {
  content?: string,
  files: DriveFile[],
  summary: DriveFileSummary,
};
