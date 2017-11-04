import { Serializable } from 'external/gs_tools/src/data';
import { DataModels } from 'external/gs_tools/src/datamodel';
import { ImmutableMap, ImmutableSet } from 'external/gs_tools/src/immutable';

import { FolderImpl } from '../data/folder-impl';

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
        ImmutableMap.of([
          ['items_', items],
          ['id_', id],
          ['name_', name],
          ['parentId_', parentId],
        ]));
  }
}
