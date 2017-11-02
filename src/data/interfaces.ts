import { ImmutableSet } from 'external/gs_tools/src/immutable';

export interface Item {
  readonly id: string;
  readonly name: string;
  readonly parentId: string | null;
  readonly path: string;

  getSearchIndex(): {name: string};
}

export interface File extends Item {
  readonly content: string;
}

export interface Folder extends Item {
  readonly items: ImmutableSet<Item>;
}
