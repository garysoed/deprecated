import { Serializable } from 'external/gs_tools/src/data';
import { DataModels, field } from 'external/gs_tools/src/datamodel';
import { ImmutableSet } from 'external/gs_tools/src/immutable';
import { StringParser } from 'external/gs_tools/src/parse';

import { FolderImpl, getInitMap_ } from '../data/folder-impl';
import { ItemType } from '../data/item-type';

@Serializable('data.DriveFolder')
export abstract class DriveFolder extends FolderImpl {
  @field('driveId', StringParser) readonly driveId_: string;

  abstract getDriveId(): string;

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
      items: ImmutableSet<string>,
      driveId: string): DriveFolder {
    return DataModels.newInstance(
        DriveFolder,
        getInitMap_(id, name, parentId, ItemType.ASSET, items)
            .set('driveId_', driveId));
  }
}
