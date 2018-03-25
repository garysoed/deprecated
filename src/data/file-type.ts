import { ApiFileType } from '../datasource';

export enum FileType {
  UNKNOWN,
  ASSET,
  METADATA,
  TEMPLATE,
}

const METADATA_NAME = '$metadata.yml';

export function convertToItemType(apiType: ApiFileType, name: string): FileType {
  if (apiType === ApiFileType.UNKNOWN) {
    return FileType.UNKNOWN;
  }

  if (apiType === ApiFileType.MARKDOWN) {
    return FileType.ASSET;
  }

  if (apiType === ApiFileType.METADATA && name === METADATA_NAME) {
    return FileType.METADATA;
  }

  return FileType.UNKNOWN;
}
