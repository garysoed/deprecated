import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { Item } from '../data/item';

export abstract class Folder extends Item {
  readonly items: ImmutableSet<Item>;
}
