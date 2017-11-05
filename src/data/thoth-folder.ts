import { Serializable } from 'external/gs_tools/src/data';
import { DataModels } from 'external/gs_tools/src/datamodel';
import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { EditableFolderImpl } from '../data/editable-folder-impl';
import { getInitMap_ } from '../data/folder-impl';

@Serializable('data.ThothFolder')
export abstract class ThothFolder extends EditableFolderImpl {
  getSearchIndex(): { name: string; } {
    return {name: this.getName()};
  }

  static newInstance(
      id: string,
      name: string,
      parentId: string | null,
      items: ImmutableSet<string>): ThothFolder {
    return DataModels.newInstance(ThothFolder, getInitMap_(id, name, parentId, items));
  }
}
