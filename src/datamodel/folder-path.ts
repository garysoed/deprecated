import { ItemId, parseId, toItemString } from '../serializable/item-id';

const SEPARATOR = '-';

export function createPath(folderIds: ItemId[]): string {
  return folderIds.map(id => toItemString(id)).join(SEPARATOR);
}

export function getFolderIds(path: string): ItemId[] {
  return path.split(SEPARATOR).map(idStr => parseId(idStr));
}

