import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { DriveFile } from '../data/drive-file';
import { FolderImpl } from '../data/folder-impl';

export class DriveFolder extends FolderImpl {
  constructor(
      readonly items: ImmutableSet<DriveFolder | DriveFile>,
      id: string,
      name: string,
      parent: FolderImpl | null,
      path: string) {
    super(items, id, name, parent, path);
  }

  getSearchIndex(): { name: string; } {
    return {name: this.name};
  }
}
