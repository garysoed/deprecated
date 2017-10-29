import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { Item } from '../data/item';

export abstract class Folder extends Item {
  constructor(
      readonly items: ImmutableSet<Item>,
      id: string,
      name: string,
      parent: Item | null,
      path: string) {
    super(id, name, parent, path);
  }
}
