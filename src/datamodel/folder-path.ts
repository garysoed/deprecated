import { BaseItemId, parseId, toItemString } from '../serializable/item-id';

const SEPARATOR = '-';

export function createPath(folderIds: BaseItemId[]): string {
  return folderIds.map(id => toItemString(id)).join(SEPARATOR);
}

export function getFolderIds(path: string): BaseItemId[] {
  return path.split(SEPARATOR).map(idStr => parseId(idStr));
}

