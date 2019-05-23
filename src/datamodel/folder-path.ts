import { ItemId, parseId } from './item-id';

const SEPARATOR = '-';

export function createPath(folderIds: ItemId[]): string {
  return folderIds.map(id => id.toString()).join(SEPARATOR);
}

export function getFolderIds(path: string): ItemId[] {
  return path.split(SEPARATOR).map(idStr => parseId(idStr));
}

