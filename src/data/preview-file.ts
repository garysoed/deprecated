import { Serializable } from 'external/gs_tools/src/data';
import { DataModels, field } from 'external/gs_tools/src/datamodel';
import { StringParser } from 'external/gs_tools/src/parse';

import { File, getInitMap_ } from '../data/file';
import { FileType } from '../data/file-type';

@Serializable('data.PreviewFile')
export abstract class PreviewFile extends File {
  @field('originalId', StringParser) readonly originalId_: string;

  abstract getOriginalId(): string;

  toString(): string {
    return `PreviewFile(${this.name_})`;
  }

  static newInstance(
      id: string,
      name: string,
      parentId: string,
      content: string,
      originalId: string): PreviewFile {
    return DataModels.newInstance(
        PreviewFile,
        getInitMap_(id, name, parentId, FileType.RENDER, content)
            .set('originalId_', originalId));
  }
}
