import { ImmutableSet } from 'external/gs_tools/src/immutable';

export interface Item {
  readonly id: string;
  readonly name: string;
  readonly parent: Folder | null;
  readonly path: string;

  getSearchIndex(): {name: string};
}

export interface File extends Item { }

export interface Folder extends Item {
  readonly items: ImmutableSet<Item>;
}
