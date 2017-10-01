import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { Folder } from '../data/folder';
import { Item } from '../data/item';

export class EditableFolder extends Folder {
  constructor(
      readonly id: string,
      readonly name: string,
      readonly path: string,
      readonly items: ImmutableSet<Item>,
      readonly parent: Folder | null) {
    super();
  }

  getSearchIndex(): {name: string} {
    return {name: this.name};
  }

  setName(name: string): EditableFolder {
    const parts = this.path.split('/');
    parts[parts.length - 1] = name;
    return new EditableFolder(this.id, name, parts.join('/'), this.items, this.parent);
  }
}
