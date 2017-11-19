/**
 * Utilities for working with ItemGraph.
 */
import { DataGraph } from 'external/gs_tools/src/datamodel';
import { Graph, GraphTime } from 'external/gs_tools/src/graph';

import { Item } from '../data/item';
import { $items } from '../data/item-graph';
import { PreviewFile } from '../data/preview-file';
import { $previews } from '../data/preview-graph';
import { ThothFolder } from '../data/thoth-folder';

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
      itemsGraph: DataGraph<Item>): Promise<string[]> {
    const item = await itemsGraph.get(id);
    if (item === null) {
      return [];
    }

    if (item instanceof ThothFolder) {
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

  async getPreview(time: GraphTime, id: string): Promise<PreviewFile | null> {
    const previewGraph = await Graph.get($previews, time);
    return previewGraph.get(id);
  }

  getRootFolderId(): string {
    return '(root)';
  }

  async save(time: GraphTime, ...items: Item[]): Promise<void> {
    const itemsGraph = await Graph.get($items, time);
    for (const item of items) {
      itemsGraph.set(item.getId(), item);
    }
  }

  async savePreview(time: GraphTime, ...previewItems: PreviewFile[]): Promise<void> {
    const previewGraph = await Graph.get($previews, time);
    for (const previewItem of previewItems) {
      previewGraph.set(previewItem.getId(), previewItem);
    }
  }
}

export const ItemService = new ItemServiceClass();
