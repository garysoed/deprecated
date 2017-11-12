/**
 * Utilities for working with ItemGraph.
 */
import { DataGraph } from 'external/gs_tools/src/datamodel';
import { Graph, GraphTime } from 'external/gs_tools/src/graph';

import { $items } from '../data/item-graph';
import { ItemImpl } from '../data/item-impl';

export class ItemServiceClass {
  async findFirstEditableAncestorPath(id: string, time: GraphTime): Promise<string[] | null> {
    const itemsGraph = await Graph.get($items, time);
    const item = await itemsGraph.get(id);
    if (item === null) {
      return null;
    }

    const parentId = item.getParentId();
    if (!parentId) {
      return null;
    }

    const path = await this.findFirstEditableAncestorPathHelper_(parentId, [], itemsGraph);
    return path.length === 0 ? null : [...path, id];
  }

  private async findFirstEditableAncestorPathHelper_(
      id: string,
      paths: string[],
      itemsGraph: DataGraph<ItemImpl>): Promise<string[]> {
    const item = await itemsGraph.get(id);
    if (item === null) {
      return [];
    }

    if (item.isEditable()) {
      return [item.getId(), ...paths];
    }

    const parentId = item.getParentId();
    if (parentId === null) {
      return [];
    }

    return this.findFirstEditableAncestorPathHelper_(
        parentId,
        [item.getId(), ...paths],
        itemsGraph);
  }

  getNameFromId(id: string): string {
    const idParts = id.split('/');
    return idParts[idParts.length - 1];
  }

  getRootFolderId(): string {
    return '(root)';
  }

  async save(time: GraphTime, ...items: ItemImpl[]): Promise<void> {
    const itemsGraph = await Graph.get($items, time);
    for (const item of items) {
      itemsGraph.set(item.getId(), item);
    }
  }
}

export const ItemService = new ItemServiceClass();
