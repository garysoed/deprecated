import { Serializable } from 'external/gs_tools/src/data';
import { DataModels } from 'external/gs_tools/src/datamodel';
import { ImmutableMap, ImmutableSet } from 'external/gs_tools/src/immutable';

import { EditableFolderImpl } from '../data/editable-folder-impl';
import { Folder } from '../data/interfaces';

@Serializable('data.ThothFolder')
export abstract class ThothFolder extends EditableFolderImpl {
  getSearchIndex(): { name: string; } {
    return {name: this.getName()};
  }

  static newInstance(
      id: string,
      name: string,
      parentId: string | null,
      items: ImmutableSet<Folder>): ThothFolder {
    return DataModels.newInstance(
        ThothFolder,
        ImmutableMap.of([
          ['items_', items],
          ['id_', id],
          ['name_', name],
          ['parentId_', parentId],
        ]));
  }
}