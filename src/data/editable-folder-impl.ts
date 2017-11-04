import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { FolderImpl } from '../data/folder-impl';

export abstract class EditableFolderImpl extends FolderImpl {
  getSearchIndex(): {name: string} {
    return {name: this.getName()};
  }

  abstract setItems(newItems: ImmutableSet<string>): this;
}
