import { Serializable } from 'external/gs_tools/src/data';
import { DataModels } from 'external/gs_tools/src/datamodel';
import { ImmutableMap } from 'external/gs_tools/src/immutable';

import { FileImpl } from '../data/file-impl';

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
      content: string): DriveFile {
    return DataModels.newInstance(
        DriveFile,
        ImmutableMap.of([
          ['id_', id],
          ['name_', name],
          ['parentId_', parentId],
          ['content_', content],
        ]));
  }
}