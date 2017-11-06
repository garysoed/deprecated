import { cache } from 'external/gs_tools/src/data';
import { field } from 'external/gs_tools/src/datamodel';
import { ImmutableMap } from 'external/gs_tools/src/immutable';
import { StringParser } from 'external/gs_tools/src/parse';

import { File } from '../data/interfaces';
import { getInitMap_ as getItemInitMap_, ItemImpl } from '../data/item-impl';
import { ItemType } from '../data/item-type';
import { ShowdownService } from '../render/showdown-service';

export function getInitMap_(
    id: string,
    name: string,
    parentId: string,
    type: ItemType,
    content: string): ImmutableMap<string | symbol, any> {
  return getItemInitMap_(id, name, parentId, type).set('content_', content);
}

export abstract class FileImpl extends ItemImpl implements File {
  @field('content', StringParser) readonly content_: string;

  abstract getContent(): string;

  @cache()
  getPreview(): string {
    return ShowdownService.render(this.content_);
  }
}
