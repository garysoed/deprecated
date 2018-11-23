import { field } from 'external/gs_tools/src/datamodel';
import { ImmutableMap } from 'external/gs_tools/src/immutable';
import { EnumParser } from 'external/gs_tools/src/parse';

import { FileType } from '../data/file-type';
import { getInitMap_ as getItemInitMap_, Item } from '../data/item';
import { Source } from '../datasource';

export function getInitMap_(
    id: string,
    name: string,
    parentId: string,
    type: FileType,
    source: Source): ImmutableMap<string | symbol, any> {
  return getItemInitMap_(id, name, parentId, source)
      .set('type_', type);
}

export abstract class File extends Item {
  // TODO: Delete?
  @field('type', EnumParser(FileType)) readonly type_!: FileType;

  abstract getType(): FileType;
}
