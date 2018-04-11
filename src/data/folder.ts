import { Serializable } from 'external/gs_tools/src/data';
import { DataModels, field } from 'external/gs_tools/src/datamodel';
import { ImmutableMap, ImmutableSet } from 'external/gs_tools/src/immutable';
import { SetParser, StringParser } from 'external/gs_tools/src/parse';

import { getInitMap_ as getInitItemMap_, Item } from '../data/item';
import { Source } from '../datasource';

export function getInitMap_(
    id: string,
    name: string,
    parentId: string | null,
    items: Iterable<string>,
    source: Source): ImmutableMap<string | symbol, any> {
  return getInitItemMap_(id, name, parentId, source)
      .set('items_', items);
}

@Serializable('data.Folder')
export abstract class Folder extends Item {
  @field('items', SetParser(StringParser))
  readonly items_!: ImmutableSet<string>;

  abstract getItems(): ImmutableSet<string>;

  getSearchIndex(): string {
    return this.getName();
  }

  toString(): string {
    return `Folder(${this.name_})`;
  }

  static newInstance(
      id: string,
      name: string,
      parentId: string | null,
      items: Iterable<string>,
      source: Source): Folder {
    return DataModels.newInstance(
        Folder,
        getInitItemMap_(id, name, parentId, source)
            .set('items_', items));
  }
}
