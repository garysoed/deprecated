import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { ItemType } from '../data/item-type';

export interface Item {
  getId(): string;

  getName(): string;

  getParentId(): string | null;

  getSearchIndex(): {name: string};

  getType(): ItemType;
}

export interface File extends Item {
  getContent(): string;
}

export interface Folder extends Item {
  getItems(): ImmutableSet<string>;
}
