import { field } from 'external/gs_tools/src/datamodel';
import { StringParser } from 'external/gs_tools/src/parse';

import { File } from '../data/interfaces';
import { ItemImpl } from '../data/item-impl';

export abstract class FileImpl extends ItemImpl implements File {
  @field('content', StringParser) readonly content_: string;

  abstract getContent(): string;
}
