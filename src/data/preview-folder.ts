import { DataModels, field } from 'external/gs_tools/src/datamodel';
import { ImmutableSet } from 'external/gs_tools/src/immutable';
import { StringParser } from 'external/gs_tools/src/parse';

import { FolderImpl, getInitMap_ } from '../data/folder-impl';
import { ItemType } from '../data/item-type';

export abstract class PreviewFolder extends FolderImpl {
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
        getInitMap_(id, name, parentId, ItemType.RENDER, items)
            .set('originalId_', originalId));
  }
}
