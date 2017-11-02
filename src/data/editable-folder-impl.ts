import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { FolderImpl } from '../data/folder-impl';
import { ItemImpl } from '../data/item-impl';

export class EditableFolderImpl extends FolderImpl {
  constructor(
      id: string,
      name: string,
      path: string,
      items: ImmutableSet<ItemImpl>,
      parentId: string | null) {
    super(items, id, name, parentId, path);
  }

  getSearchIndex(): {name: string} {
    return {name: this.name};
  }

  setName(name: string): EditableFolderImpl {
    const parts = this.path.split('/');
    parts[parts.length - 1] = name;
    return new EditableFolderImpl(this.id, name, parts.join('/'), this.items, this.parentId);
  }
}
