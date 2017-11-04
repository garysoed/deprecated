import { field } from 'external/gs_tools/src/datamodel';
import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { SetParser, StringParser } from 'external/gs_tools/src/parse';
import { Folder } from '../data/interfaces';
import { ItemImpl } from '../data/item-impl';

export abstract class FolderImpl extends ItemImpl implements Folder {
  @field('items', SetParser(StringParser))
  readonly items_: ImmutableSet<string>;

  abstract getItems(): ImmutableSet<string>;
}
