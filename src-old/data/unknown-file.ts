import { Serializable } from 'external/gs_tools/src/data';
import { DataModels } from 'external/gs_tools/src/datamodel';

import { File, getInitMap_ } from '../data/file';
import { FileType } from '../data/file-type';
import { Source } from '../datasource';

@Serializable('data.UnknownFile')
export abstract class UnknownFile extends File {
  getSearchIndex(): string {
    return this.getName();
  }

  toString(): string {
    return `UnknownFile(${this.name_})`;
  }

  static newInstance(
      id: string,
      name: string,
      parentId: string,
      source: Source): UnknownFile {
    return DataModels.newInstance(
        UnknownFile,
        getInitMap_(id, name, parentId, FileType.UNKNOWN, source));
  }
}
