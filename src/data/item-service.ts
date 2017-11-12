/**
 * Utilities for working with ItemGraph.
 */
import { Graph, GraphTime } from 'external/gs_tools/src/graph';

import { $items } from '../data/item-graph';
import { ItemImpl } from '../data/item-impl';

export class ItemServiceClass {
  async save(time: GraphTime, ...items: ItemImpl[]): Promise<void> {
    const itemsGraph = await Graph.get($items, time);
    for (const item of items) {
      itemsGraph.set(item.getId(), item);
    }
  }
}

export const ItemService = new ItemServiceClass();
