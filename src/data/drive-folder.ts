import { Serializable } from 'external/gs_tools/src/data';
import { DataModels } from 'external/gs_tools/src/datamodel';
import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { FolderImpl, getInitMap_ } from '../data/folder-impl';
import { ItemType } from '../data/item-type';

@Serializable('data.DriveFolder')
export abstract class DriveFolder extends FolderImpl {
  getSearchIndex(): { name: string; } {
    return {name: this.getName()};
  }

  toString(): string {
    return `DriveFolder(${this.name_})`;
  }

  static newInstance(
      id: string,
      name: string,
      parentId: string | null,
      items: ImmutableSet<string>): DriveFolder {
    return DataModels.newInstance(
        DriveFolder,
        getInitMap_(id, name, parentId, ItemType.ASSET, items));
  }
}
