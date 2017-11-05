import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { ApiDriveType } from '../import/drive';

export enum ItemType {
  UNKNOWN,
  FOLDER,
  FILE,
  UNHANDLED_FILE,
}

const HANDLED_FILE_TYPES = ImmutableSet.of([
  ApiDriveType.MARKDOWN,
]);
export function convertToItemType(apiType: ApiDriveType): ItemType {
  if (apiType === ApiDriveType.UNKNOWN) {
    return ItemType.UNKNOWN;
  }

  if (apiType === ApiDriveType.FOLDER) {
    return ItemType.FOLDER;
  }

  return HANDLED_FILE_TYPES.has(apiType) ? ItemType.FILE : ItemType.UNHANDLED_FILE;
}
