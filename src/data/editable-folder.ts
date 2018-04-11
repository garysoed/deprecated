import { Serializable } from 'external/gs_tools/src/data';
import { DataModels } from 'external/gs_tools/src/datamodel';
import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { Folder, getInitMap_ as getInitFolderMap_ } from '../data/folder';
import { Source } from '../datasource';


@Serializable('data.EditableFolder')
export abstract class EditableFolder extends Folder {

  getSearchIndex(): string {
    return this.getName();
  }

  abstract setItems(items: ImmutableSet<string>): EditableFolder;

  toString(): string {
    return `EditableFolder(${this.name_})`;
  }

  static newInstance(
      id: string,
      name: string,
      parentId: string | null,
      items: Iterable<string>,
      source: Source): EditableFolder {
    return DataModels.newInstance(
        EditableFolder,
        getInitFolderMap_(id, name, parentId, items, source));
  }
}
