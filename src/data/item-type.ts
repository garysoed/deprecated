import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { ApiDriveType } from '../import';

export enum ItemType {
  UNKNOWN,
  ASSET,
  RENDER,
  UNHANDLED_ITEM,
}

const HANDLED_FILE_TYPES = ImmutableSet.of([
  ApiDriveType.FOLDER,
  ApiDriveType.MARKDOWN,
]);
export function convertToItemType(apiType: ApiDriveType): ItemType {
  if (apiType === ApiDriveType.UNKNOWN) {
    return ItemType.UNKNOWN;
  }

  return HANDLED_FILE_TYPES.has(apiType) ? ItemType.ASSET : ItemType.UNHANDLED_ITEM;
}
