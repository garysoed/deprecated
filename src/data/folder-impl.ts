import { field } from 'external/gs_tools/src/datamodel';
import { ImmutableMap, ImmutableSet } from 'external/gs_tools/src/immutable';
import { SetParser, StringParser } from 'external/gs_tools/src/parse';

import { Folder } from '../data/interfaces';
import { getInitMap_ as getInitItemMap_, ItemImpl } from '../data/item-impl';
import { ItemType } from '../data/item-type';

export function getInitMap_(
    id: string,
    name: string,
    parentId: string | null,
    type: ItemType,
    items: Iterable<string>): ImmutableMap<string | symbol, any> {
  return getInitItemMap_(id, name, parentId, type).set('items_', items);
}

export abstract class FolderImpl extends ItemImpl implements Folder {
  @field('items', SetParser(StringParser))
  readonly items_: ImmutableSet<string>;

  abstract getItems(): ImmutableSet<string>;
}
