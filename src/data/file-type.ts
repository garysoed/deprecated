import { ApiDriveType } from '../import';

export enum FileType {
  UNKNOWN,
  ASSET,
  METADATA,
  TEMPLATE,
}

const METADATA_NAME = '$metadata.json';

export function convertToItemType(apiType: ApiDriveType, name: string): FileType {
  if (apiType === ApiDriveType.UNKNOWN) {
    return FileType.UNKNOWN;
  }

  if (apiType === ApiDriveType.MARKDOWN) {
    return FileType.ASSET;
  }

  if (apiType === ApiDriveType.JSON && name === METADATA_NAME) {
    return FileType.METADATA;
  }

  return FileType.UNKNOWN;
}
