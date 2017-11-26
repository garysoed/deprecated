/**
 * Utilities for working with ItemGraph.
 */
import { InstanceofType } from 'external/gs_tools/src/check';
import { DataGraph } from 'external/gs_tools/src/datamodel';
import { Errors } from 'external/gs_tools/src/error';
import { Graph, staticId } from 'external/gs_tools/src/graph';
import { ImmutableSet } from 'external/gs_tools/src/immutable';
import { Locations } from 'external/gs_tools/src/ui';

import { Folder } from '../data/folder';
import { Item } from '../data/item';
import { $items } from '../data/item-graph';
import { $projectService, ProjectService } from '../data/project-service';
import { ROOT_PATH } from '../data/selected-item-graph';
import { ThothFolder } from '../data/thoth-folder';

export class ItemService {
  constructor(
      private readonly itemsGraph_: DataGraph<Item>,
      private readonly projectService_: ProjectService) { }

  async getItem(id: string): Promise<Item | null> {
    return this.itemsGraph_.get(id);
  }

  async getItemByPath(
      path: string,
      rootFolder: Folder | null = null): Promise<Item | null> {
    const normalizedPath = Locations.normalizePath(path);
    let [, current, ...rest] = normalizedPath.split('/');

    let root: Folder;
    if (rootFolder) {
      root = rootFolder;
    } else if (current === ROOT_PATH.substr(1)) {
      root = await this.getRootFolder();
      [current, ...rest] = rest;
    } else {
      return null;
    }

    // Search for the item with name === current.
    const items = await Promise.all(root.getItems()
        .mapItem((itemId) => this.getItem(itemId)));
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

    return this.getItemByPath(rest.join('/'), nextItem);
  }

  async getPath(id: string, suffixes: string[] = []): Promise<string | null> {
    const item = await this.getItem(id);
    if (!item) {
      return null;
    }

    const newSuffixes = [item.getName(), ...suffixes];

    const parentId = item.getParentId();
    return parentId ?
        this.getPath(parentId, newSuffixes) : Locations.normalizePath(newSuffixes.join('/'));
  }

  async getRootFolder(): Promise<ThothFolder> {
    const project = await this.projectService_.get();
    const rootFolderId = project.getRootFolderId();
    const rootFolder = await this.getItem(rootFolderId);
    if (rootFolder instanceof ThothFolder) {
      return rootFolder;
    }

    const newRootFolder = ThothFolder.newInstance(
        rootFolderId,
        '(root)',
        null,
        ImmutableSet.of([]));
    await this.save(newRootFolder);
    return newRootFolder;
  }

  async newId(): Promise<string> {
    return this.itemsGraph_.generateId();
  }

  async save(...items: Item[]): Promise<void> {
    for (const item of items) {
      this.itemsGraph_.set(item.getId(), item);
    }
  }
}

export const $itemService = staticId('itemService', InstanceofType(ItemService));
Graph.registerProvider(
    $itemService,
    (itemsGraph, projectService) => {
      return new ItemService(itemsGraph, projectService);
    },
    $items,
    $projectService);
