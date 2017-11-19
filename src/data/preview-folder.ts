import { DataModels, field } from 'external/gs_tools/src/datamodel';
import { ImmutableSet } from 'external/gs_tools/src/immutable';
import { StringParser } from 'external/gs_tools/src/parse';

import { Folder, getInitMap_ } from '../data/folder';

export abstract class PreviewFolder extends Folder {
  @field('originalId', StringParser) readonly originalId_: string;

  abstract getOriginalId(): string;

  toString(): string {
    return `PreviewFolder(${this.name_})`;
  }

  static newInstance(
      id: string,
      name: string,
      parentId: string | null,
      items: ImmutableSet<string>,
      originalId: string): PreviewFolder {
    return DataModels.newInstance(
        PreviewFolder,
        getInitMap_(id, name, parentId, items)
            .set('originalId_', originalId));
  }
}
