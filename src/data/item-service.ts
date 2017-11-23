/**
 * Utilities for working with ItemGraph.
 */
import { Graph, GraphTime } from 'external/gs_tools/src/graph';

import { Item } from '../data/item';
import { $items } from '../data/item-graph';
import { PreviewFile } from '../data/preview-file';
import { $previews } from '../data/preview-graph';

const ROOT_FOLDER_ID = '(root)';

export class ItemServiceClass {
  async getPreview(time: GraphTime, id: string): Promise<PreviewFile | null> {
    const previewGraph = await Graph.get($previews, time);
    return previewGraph.get(id);
  }

  getRootFolderId(): string {
    return ROOT_FOLDER_ID;
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
