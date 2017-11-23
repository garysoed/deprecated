import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { Folder } from '../data/folder';

export abstract class EditableFolder extends Folder {
  getSearchIndex(): string {
    return this.getName();
  }

  abstract setItems(newItems: ImmutableSet<string>): this;
}
