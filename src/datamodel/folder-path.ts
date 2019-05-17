const SEPARATOR = '-';

export function createPath(folderIds: string[]): string {
  return folderIds.join(SEPARATOR);
}

export function getFolderIds(path: string): string[] {
  return path.split(SEPARATOR);
}

