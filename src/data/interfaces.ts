import { ImmutableSet } from 'external/gs_tools/src/immutable';

export interface Item {
  getId(): string;

  getName(): string;

  getParentId(): string | null;

  getSearchIndex(): {name: string};
}

export interface File extends Item {
  getContent(): string;
}

export interface Folder extends Item {
  getItems(): ImmutableSet<string>;
}
