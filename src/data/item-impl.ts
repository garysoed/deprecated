import { DataModel, field } from 'external/gs_tools/src/datamodel';
import { ImmutableMap } from 'external/gs_tools/src/immutable';
import { EnumParser, StringParser } from 'external/gs_tools/src/parse';

import { Item } from '../data/interfaces';
import { ItemType } from '../data/item-type';

export function getInitMap_(id: string, name: string, parentId: string | null, type: ItemType):
    ImmutableMap<string | symbol, any> {
  return ImmutableMap.of<string | symbol, any>([
    ['id_', id],
    ['name_', name],
    ['parentId_', parentId],
    ['type_', type],
  ]);
}

export abstract class ItemImpl implements DataModel<{ name: string }>, Item {
  @field('id', StringParser) readonly id_: string;
  @field('name', StringParser) readonly name_: string;
  @field('parentId', StringParser) readonly parentId_: string | null;
  @field('type', EnumParser(ItemType)) readonly type_: ItemType;

  constructor() { }

  abstract getId(): string;

  abstract getName(): string;

  abstract getParentId(): string | null;

  abstract getSearchIndex(): {name: string};

  abstract getType(): ItemType;
}
