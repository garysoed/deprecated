import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { DriveFile } from '../data/drive-file';
import { FolderImpl } from '../data/folder-impl';

export class DriveFolder extends FolderImpl {
  constructor(
      readonly items: ImmutableSet<DriveFolder | DriveFile>,
      id: string,
      name: string,
      parentId: string | null,
      path: string) {
    super(items, id, name, parentId, path);
  }

  getSearchIndex(): { name: string; } {
    return {name: this.name};
  }
}
