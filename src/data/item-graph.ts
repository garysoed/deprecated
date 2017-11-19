import { registerDataGraph, Searcher } from 'external/gs_tools/src/datamodel';
import { ImmutableList, ImmutableSet } from 'external/gs_tools/src/immutable';
import { DataModelParser } from 'external/gs_tools/src/parse';
import { LocalStorage } from 'external/gs_tools/src/store';

import { Item } from '../data/item';

class ItemSearcher implements Searcher<Item> {
  private readonly index_: Map<string, Item> = new Map();

  async index(data: Promise<ImmutableSet<Item>>): Promise<void> {
    const items = await data;
    this.index_.clear();
    for (const item of items) {
      this.index_.set(item.getName(), item);
    }
  }

  async search(token: string): Promise<ImmutableList<Item>> {
    const item = this.index_.get(token);
    if (!item) {
      return ImmutableList.of([]);
    }

    return ImmutableList.of([item]);
  }
}

export const $items = registerDataGraph<Item>(
    'items',
    new ItemSearcher(),
    new LocalStorage<Item>(window, 'th-i', DataModelParser<Item>()));
