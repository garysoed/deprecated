import { field } from 'external/gs_tools/src/datamodel';
import { ImmutableMap } from 'external/gs_tools/src/immutable';
import { EnumParser, StringParser } from 'external/gs_tools/src/parse';

import { FileType } from '../data/file-type';
import { getInitMap_ as getItemInitMap_, Item } from '../data/item';

export function getInitMap_(
    id: string,
    name: string,
    parentId: string,
    type: FileType,
    content: string): ImmutableMap<string | symbol, any> {
  return getItemInitMap_(id, name, parentId)
      .set('content_', content)
      .set('type_', type);
}

export abstract class File extends Item {
  @field('content', StringParser) readonly content_!: string;
  @field('type', EnumParser(FileType)) readonly type_!: FileType;

  abstract getContent(): string;

  abstract getType(): FileType;
}
