/**
 * Utilities for working with ItemGraph.
 */
import { Graph, GraphTime } from 'external/gs_tools/src/graph';
import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { Locations } from 'external/gs_tools/src/ui';

import { Errors } from 'external/gs_tools/src/error';
import { Folder } from '../data/folder';
import { Item } from '../data/item';
import { $items } from '../data/item-graph';
import { PreviewFile } from '../data/preview-file';
import { $previews } from '../data/preview-graph';
import { ProjectService } from '../data/project-service';
import { ROOT_PATH } from '../data/selected-item-graph';
import { ThothFolder } from '../data/thoth-folder';

export class ItemServiceClass {
  async getItem(id: string, time: GraphTime): Promise<Item | null> {
    const itemsGraph = await Graph.get($items, time);
    return itemsGraph.get(id);
  }

  async getItemByPath(
      time: GraphTime,
      path: string,
      rootFolder: Folder | null = null): Promise<Item | null> {
    const normalizedPath = Locations.normalizePath(path);
    let [, current, ...rest] = normalizedPath.split('/');

    let root: Folder;
    if (rootFolder) {
      root = rootFolder;
    } else if (current === ROOT_PATH.substr(1)) {
      root = await this.getRootFolder(time);
      [current, ...rest] = rest;
    } else {
      return null;
    }

    // Search for the item with name === current.
    const items = await Promise.all(root.getItems()
        .mapItem((itemId) => this.getItem(itemId, time)));
    const nextItem = items.find((item) => {
      if (!item) {
        return false;
      }

      return item.getName() === current;
    });

    if (rest.length <= 0) {
      return nextItem || null;
    }

    if (!(nextItem instanceof Folder)) {
      throw Errors.assert(`item at ${path}`).shouldBe('a [Folder]').butWas(nextItem);
    }

    return this.getItemByPath(time, rest.join('/'), nextItem);
  }

  async getPreview(time: GraphTime, id: string): Promise<PreviewFile | null> {
    const previewGraph = await Graph.get($previews, time);
    return previewGraph.get(id);
  }

  async getRootFolder(time: GraphTime): Promise<ThothFolder> {
    const project = await ProjectService.get(time);
    const rootFolderId = project.getRootFolderId();
    const rootFolder = await this.getItem(rootFolderId, time);
    if (rootFolder instanceof ThothFolder) {
      return rootFolder;
    }

    const newRootFolder = ThothFolder.newInstance(
        rootFolderId,
        '(root)',
        null,
        ImmutableSet.of([]));
    await this.save(time, newRootFolder);
    return newRootFolder;
  }

  async newId(time: GraphTime): Promise<string> {
    const itemsGraph = await Graph.get($items, time);
    return itemsGraph.generateId();
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
