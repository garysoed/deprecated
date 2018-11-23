import { Serializable } from 'external/gs_tools/src/data';
import { DataModels, field } from 'external/gs_tools/src/datamodel';
import { StringParser } from 'external/gs_tools/src/parse';

import { File, getInitMap_ } from '../data/file';
import { FileType } from '../data/file-type';
import { Source } from '../datasource';

@Serializable('data.MetadataFile')
export abstract class MetadataFile extends File {
  @field('content', StringParser) readonly content_!: string;

  abstract getContent(): string;

  getSearchIndex(): string {
    return this.getName();
  }

  toString(): string {
    return `MetadataFile(${this.name_})`;
  }

  static newInstance(
      id: string,
      name: string,
      parentId: string,
      content: string,
      source: Source): MetadataFile {
    return DataModels.newInstance(
        MetadataFile,
        getInitMap_(id, name, parentId, FileType.METADATA, source)
            .set('content_', content));
  }
}
