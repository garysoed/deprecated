import { Serializable } from 'external/gs_tools/src/data';
import { DataModels } from 'external/gs_tools/src/datamodel';
import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { Folder, getInitMap_ } from '../data/folder';
import { DriveSource } from '../datasource';

@Serializable('data.DriveFolder')
export abstract class DriveFolder extends Folder {
  getSearchIndex(): string {
    return this.getName();
  }

  toString(): string {
    return `DriveFolder(${this.name_})`;
  }

  static newInstance(
      id: string,
      name: string,
      parentId: string | null,
      items: ImmutableSet<string>,
      source: DriveSource): DriveFolder {
    return DataModels.newInstance(
        DriveFolder,
        getInitMap_(id, name, parentId, items, source));
  }
}
