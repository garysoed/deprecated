/**
 * Utilities for working with ItemGraph.
 */
import { InstanceofType } from 'external/gs_tools/src/check';
import { DataGraph } from 'external/gs_tools/src/datamodel';
import { Errors } from 'external/gs_tools/src/error';
import { Graph, staticId } from 'external/gs_tools/src/graph';
import { ImmutableMap, ImmutableSet, TreeMap } from 'external/gs_tools/src/immutable';
import { AbsolutePath, Path } from 'external/gs_tools/src/path';

import { Folder } from '../data/folder';

import { DriveFolder } from '.';
import { Item } from '../data/item';
import { $items } from '../data/item-graph';
import { MarkdownFile } from '../data/markdown-file';
import { MetadataFile } from '../data/metadata-file';
import { $projectService, ProjectService } from '../data/project-service';
import { ROOT_PATH } from '../data/selected-item-graph';
import { ThothFolder } from '../data/thoth-folder';
import { UnknownFile } from '../data/unknown-file';
import { ApiDriveFile, ApiDriveType } from '../datasource';

export class ItemService {
  constructor(
      private readonly itemsGraph_: DataGraph<Item>,
      private readonly projectService_: ProjectService) { }

  private createItem_(
      containerId: string,
      driveItem: ApiDriveFile,
      driveItemIdToItemIdMap: ImmutableMap<string, string>): Item {
    const {type, name: filename, source} = driveItem.summary;
    const driveId = source.getDriveId();
    const itemId = driveItemIdToItemIdMap.get(driveId);
    if (!itemId) {
      throw Errors.assert(`itemId for driveId ${driveId}`).shouldExist().butNot();
    }
    const content = driveItem.content || '';
    switch (type) {
      case ApiDriveType.MARKDOWN:
        return MarkdownFile.newInstance(itemId, filename, containerId, content, source);
      case ApiDriveType.YAML:
        return MetadataFile.newInstance(itemId, filename, containerId, content, source);
      case ApiDriveType.FOLDER:
        return DriveFolder.newInstance(
            itemId,
            filename,
            containerId,
            ImmutableSet.of(driveItem.files.map((driveFile) => {
              const driveId = driveFile.summary.source.getDriveId();
              const itemId = driveItemIdToItemIdMap.get(driveId);
              if (!itemId) {
                throw Errors.assert(`itemId for ${driveId}`).shouldExist().butNot();
              }
              return itemId;
            })),
            source);
      default:
        return UnknownFile.newInstance(itemId, filename, containerId, source);
    }
  }

  async deleteItem(id: string): Promise<void> {
    // Now delete the item from the parent.
    const item = await this.getItem(id);
    if (!item) {
      return;
    }

    // Delete the item
    this.itemsGraph_.delete(id);

    const parentId = item.getParentId();
    if (!parentId) {
      return;
    }

    const parent = await this.getItem(parentId);
    if (!(parent instanceof ThothFolder)) {
      return;
    }

    return this.save(parent.setItems(parent.getItems().delete(id)));
  }

  async getItem(id: string): Promise<Item | null> {
    return this.itemsGraph_.get(id);
  }

  getItemByPath(path: Path): Promise<Item | null> {
    return this.getItemByPath_([...path.getParts()], null);
  }

  private async getItemByPath_(path: string[], rootFolder: Folder | null):
      Promise<Item | null> {
    let [current, ...rest] = path;
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

    return this.getItemByPath_(rest, nextItem);
  }

  async getPath(id: string, suffixes: string[] = []): Promise<Path | null> {
    const item = await this.getItem(id);
    if (!item) {
      return null;
    }

    const newSuffixes = [item.getName(), ...suffixes];

    const parentId = item.getParentId();
    return parentId ?
        this.getPath(parentId, newSuffixes) :
        new AbsolutePath(newSuffixes);
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

  async recursiveCreate(driveTree: TreeMap<string, ApiDriveFile>, containerId: string):
      Promise<TreeMap<string, Item>> {
    const idPromises = driveTree.preOrder()
        .map(async (node) => {
          const itemId = await this.newId();
          const driveId = node.getValue().summary.source.getDriveId();
          return [driveId, itemId] as [string, string];
        });
    const driveIdToItemIdMap = ImmutableMap.of(await Promise.all([...idPromises]));

    return driveTree.map((node, _, parent) => {
      const value = node.getValue();
      const driveId = value.summary.source.getDriveId();
      const itemId = driveIdToItemIdMap.get(driveId)!;
      const parentItemId = parent ?
          driveIdToItemIdMap.get(parent.getValue().summary.source.getDriveId())! :
          containerId;
      return [itemId, this.createItem_(parentItemId, value, driveIdToItemIdMap)];
    });
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
