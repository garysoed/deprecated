import { DataModel, field } from 'external/gs_tools/src/datamodel';
import { StringParser } from 'external/gs_tools/src/parse';

import { Item } from '../data/interfaces';

export abstract class ItemImpl implements DataModel<{ name: string }>, Item {
  @field('id', StringParser) readonly id_: string;
  @field('name', StringParser) readonly name_: string;
  @field('parentId', StringParser) readonly parentId_: string | null;

  constructor() { }

  abstract getId(): string;

  abstract getName(): string;

  abstract getParentId(): string | null;

  abstract getSearchIndex(): {name: string};
}
