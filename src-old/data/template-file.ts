import { Serializable } from 'external/gs_tools/src/data';
import { DataModels, field } from 'external/gs_tools/src/datamodel';
import { StringParser } from 'external/gs_tools/src/parse';

import { File, getInitMap_ } from '../data/file';
import { FileType } from '../data/file-type';
import { Source } from '../datasource';

@Serializable('data.TemplateFile')
export abstract class TemplateFile extends File {
  @field('content', StringParser) readonly content_!: string;

  abstract getContent(): string;

  getSearchIndex(): string {
    return this.getName();
  }

  toString(): string {
    return `TemplateFile(${this.name_})`;
  }

  static newInstance(
      id: string,
      name: string,
      parentId: string,
      content: string,
      source: Source): TemplateFile {
    return DataModels.newInstance(
        TemplateFile,
        getInitMap_(id, name, parentId, FileType.TEMPLATE, source)
            .set('content_', content));
  }
}
