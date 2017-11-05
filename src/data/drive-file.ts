import { Serializable } from 'external/gs_tools/src/data';
import { DataModels } from 'external/gs_tools/src/datamodel';

import { FileImpl, getInitMap_ } from '../data/file-impl';
import { ItemType } from '../data/item-type';

@Serializable('data.DriveFile')
export abstract class DriveFile extends FileImpl {
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
      content: string): DriveFile {
    return DataModels.newInstance(DriveFile, getInitMap_(id, name, parentId, type, content));
  }
}
