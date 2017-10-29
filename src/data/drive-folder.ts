import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { DriveFile } from '../data/drive-file';
import { Folder } from '../data/folder';
import { Item } from '../data/item';

export class DriveFolder extends Folder {
  constructor(
      readonly items: ImmutableSet<DriveFolder | DriveFile>,
      id: string,
      name: string,
      parent: Item | null,
      path: string) {
    super(items, id, name, parent, path);
  }

  getSearchIndex(): { name: string; } {
    return {name: this.name};
  }
}
