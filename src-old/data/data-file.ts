import { Serializable } from 'external/gs_tools/src/data';
import { DataModels, field } from 'external/gs_tools/src/datamodel';
import { JsonParser } from 'external/gs_tools/src/parse';

import { File, getInitMap_ } from '../data/file';
import { FileType } from '../data/file-type';
import { Source } from '../datasource';

@Serializable('data.DataFile')
export abstract class DataFile extends File {
  @field('content', JsonParser) readonly content_!: gs.IJson;

  abstract getContent(): gs.IJson;

  getSearchIndex(): string {
    return this.getName();
  }

  toString(): string {
    return `DataFile(${this.name_})`;
  }

  static newInstance(
      id: string,
      name: string,
      parentId: string,
      content: gs.IJson,
      source: Source): DataFile {
    return DataModels.newInstance(
        DataFile,
        getInitMap_(id, name, parentId, FileType.DATA, source)
            .set('content_', content));
  }
}
