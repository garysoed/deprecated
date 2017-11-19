import { field } from 'external/gs_tools/src/datamodel';
import { ImmutableMap, ImmutableSet } from 'external/gs_tools/src/immutable';
import { SetParser, StringParser } from 'external/gs_tools/src/parse';

import { getInitMap_ as getInitItemMap_, Item } from '../data/item';

export function getInitMap_(
    id: string,
    name: string,
    parentId: string | null,
    items: Iterable<string>): ImmutableMap<string | symbol, any> {
  return getInitItemMap_(id, name, parentId).set('items_', items);
}

export abstract class Folder extends Item {
  @field('items', SetParser(StringParser))
  readonly items_: ImmutableSet<string>;

  abstract getItems(): ImmutableSet<string>;
}