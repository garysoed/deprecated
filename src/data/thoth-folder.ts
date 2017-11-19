import { Serializable } from 'external/gs_tools/src/data';
import { DataModels } from 'external/gs_tools/src/datamodel';
import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { Folder, getInitMap_ } from '../data/folder';

@Serializable('data.ThothFolder')
export abstract class ThothFolder extends Folder {
  getSearchIndex(): { name: string; } {
    return {name: this.getName()};
  }

  abstract setItems(newItems: ImmutableSet<string>): this;

  static newInstance(
      id: string,
      name: string,
      parentId: string | null,
      items: ImmutableSet<string>): ThothFolder {
    return DataModels.newInstance(
        ThothFolder,
        getInitMap_(id, name, parentId, items));
  }
}
