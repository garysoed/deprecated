import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { ApiDriveType } from '../import';

export enum FileType {
  UNKNOWN,
  ASSET,
  METADATA,
  TEMPLATE,
}

const HANDLED_FILE_TYPES = ImmutableSet.of([
  ApiDriveType.FOLDER,
  ApiDriveType.MARKDOWN,
]);
export function convertToItemType(apiType: ApiDriveType): FileType {
  if (apiType === ApiDriveType.UNKNOWN) {
    return FileType.UNKNOWN;
  }

  return HANDLED_FILE_TYPES.has(apiType) ? FileType.ASSET : FileType.UNKNOWN;
}
