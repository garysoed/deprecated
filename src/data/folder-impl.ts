import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { Folder } from '../data/interfaces';
import { ItemImpl } from '../data/item-impl';

export abstract class FolderImpl extends ItemImpl implements Folder {
  constructor(
      readonly items: ImmutableSet<ItemImpl>,
      id: string,
      name: string,
      parentId: string | null,
      path: string) {
    super(id, name, parentId, path);
  }
}
