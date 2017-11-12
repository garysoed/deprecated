import { Serializable } from 'external/gs_tools/src/data';
import { DataModels, field } from 'external/gs_tools/src/datamodel';
import { StringParser } from 'external/gs_tools/src/parse';

import { FileImpl, getInitMap_ } from '../data/file-impl';
import { ItemType } from '../data/item-type';

@Serializable('data.PreviewFile')
export abstract class PreviewFile extends FileImpl {
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
        getInitMap_(id, name, parentId, ItemType.RENDER, content).set('originalId_', originalId));
  }
}
