import { Serializable } from 'external/gs_tools/src/data';
import { DataModels } from 'external/gs_tools/src/datamodel';

import { File, getInitMap_ } from '../data/file';
import { FileType } from '../data/file-type';
import { DriveSource } from '../datasource';

@Serializable('data.DriveFile')
export abstract class DriveFile extends File<DriveSource> {
  getSearchIndex(): string {
    return this.getName();
  }

  toString(): string {
    return `DriveFile(${this.name_})`;
  }

  static newInstance(
      id: string,
      name: string,
      parentId: string,
      type: FileType,
      content: string,
      source: DriveSource): DriveFile {
    return DataModels.newInstance(
        DriveFile,
        getInitMap_(id, name, parentId, type, content, source));
  }
}
