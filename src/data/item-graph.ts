import { registerDataGraph, Searcher } from 'external/gs_tools/src/datamodel';
import { ImmutableList, ImmutableSet } from 'external/gs_tools/src/immutable';
import { DataModelParser } from 'external/gs_tools/src/parse';
import { LocalStorage } from 'external/gs_tools/src/store';

import { ItemImpl } from '../data/item-impl';

class ItemSearcher implements Searcher<ItemImpl> {
  private readonly index_: Map<string, ItemImpl> = new Map();

  async index(data: Promise<ImmutableSet<ItemImpl>>): Promise<void> {
    const items = await data;
    this.index_.clear();
    for (const item of items) {
      this.index_.set(item.name, item);
    }
  }

  async search(token: string): Promise<ImmutableList<ItemImpl>> {
    const item = this.index_.get(token);
    if (!item) {
      return ImmutableList.of([]);
    }

    return ImmutableList.of([item]);
  }
}

export const $items = registerDataGraph<ItemImpl>(
    new ItemSearcher(),
    new LocalStorage<ItemImpl>(window, 'th', DataModelParser<ItemImpl>()));
