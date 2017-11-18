import { Serializable } from 'external/gs_tools/src/data';
import { DataModels, field } from 'external/gs_tools/src/datamodel';
import { StringParser } from 'external/gs_tools/src/parse';

import { FileImpl, getInitMap_ } from '../data/file-impl';
import { ItemType } from '../data/item-type';

@Serializable('data.DriveFile')
export abstract class DriveFile extends FileImpl {
  @field('driveId', StringParser) readonly driveId_: string;

  abstract getDriveId(): string;

  getSearchIndex(): { name: string; } {
    return {name: this.getName()};
  }

  toString(): string {
    return `DriveFile(${this.name_})`;
  }

  static newInstance(
      id: string,
      name: string,
      parentId: string,
      type: ItemType,
      content: string,
      driveId: string): DriveFile {
    return DataModels.newInstance(
        DriveFile,
        getInitMap_(id, name, parentId, type, content)
            .set('driveId_', driveId));
  }
}
