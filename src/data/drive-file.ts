import { Serializable } from 'external/gs_tools/src/data';
import { DataModels, field } from 'external/gs_tools/src/datamodel';
import { StringParser } from 'external/gs_tools/src/parse';

import { File, getInitMap_ } from '../data/file';
import { FileType } from '../data/file-type';

@Serializable('data.DriveFile')
export abstract class DriveFile extends File {
  @field('driveId', StringParser) readonly driveId_: string;

  abstract getDriveId(): string;

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
      driveId: string): DriveFile {
    return DataModels.newInstance(
        DriveFile,
        getInitMap_(id, name, parentId, type, content)
            .set('driveId_', driveId));
  }
}
