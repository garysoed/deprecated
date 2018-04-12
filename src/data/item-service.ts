/**
 * Utilities for working with ItemGraph.
 */
import { InstanceofType } from 'external/gs_tools/src/check';
import { DataGraph } from 'external/gs_tools/src/datamodel';
import { Errors } from 'external/gs_tools/src/error';
import { Graph, staticId } from 'external/gs_tools/src/graph';
import { ImmutableMap, ImmutableSet, TreeMap } from 'external/gs_tools/src/immutable';
import { AbsolutePath, Path } from 'external/gs_tools/src/path';
import { assertUnreachable } from 'external/gs_tools/src/typescript';

import { DataFile } from '../data/data-file';
import { EditableFolder } from '../data/editable-folder';
import { Folder } from '../data/folder';
import { Item } from '../data/item';
import { $items } from '../data/item-graph';
import { MarkdownFile } from '../data/markdown-file';
import { MetadataFile } from '../data/metadata-file';
import { ProcessorFile } from '../data/processor-file';
import { $projectService, ProjectService } from '../data/project-service';
import { ROOT_PATH } from '../data/selected-item-graph';
import { $sourceService, SourceService } from '../data/source-service';
import { TemplateFile } from '../data/template-file';
import { UnknownFile } from '../data/unknown-file';
import { ApiFile, ApiFileType, DriveSource, Source, ThothSource } from '../datasource';

export class ItemService {
  constructor(
      private readonly itemsGraph_: DataGraph<Item>,
      private readonly projectService_: ProjectService,
      private readonly sourceService_: SourceService) { }

  async addItems(source: DriveSource, containerId: string): Promise<TreeMap<string, Item> | null> {
    const apiFileTree = await this.sourceService_.recursiveGet(source);
    if (!apiFileTree) {
      return null;
    }

    const [itemTree, containerItem] = await Promise.all([
      this.recursiveCreate(apiFileTree, containerId),
      this.getItem(containerId),
    ]);

    if (!(containerItem instanceof EditableFolder)) {
      throw Errors.assert(`Item for ${containerId}`).shouldBeA(InstanceofType(EditableFolder))
          .butNot();
    }

    const newContainerItem = containerItem
        .setItems(containerItem.getItems().add(itemTree.getValue().getId()));
    await Promise.all([
      itemTree.preOrder().map((node) => this.save(node.getValue())),
      this.save(newContainerItem),
    ]);
    return itemTree;
  }

  private createItem_(
      containerId: string,
      driveItem: ApiFile<Source>,
      sourceItemIdToItemIdMap: ImmutableMap<string, string>): Item {
    const {type, name: filename, source} = driveItem.summary;
    const driveId = source.getId();
    const itemId = sourceItemIdToItemIdMap.get(driveId);
    if (!itemId) {
      throw Errors.assert(`itemId for driveId ${driveId}`).shouldExist().butNot();
    }
    const content = driveItem.content || '';
    switch (type) {
      case ApiFileType.TSV:
        const contentData = content.split('\n').map(line => {
          return line.split('\t');
        });
        return DataFile.newInstance(
            itemId,
            filename,
            containerId,
            contentData,
            source);
      case ApiFileType.MARKDOWN:
        return MarkdownFile.newInstance(itemId, filename, containerId, content, source);
      case ApiFileType.METADATA:
        return MetadataFile.newInstance(itemId, filename, containerId, content, source);
      case ApiFileType.FOLDER:
        if (!(source instanceof DriveSource)) {
          throw Errors.assert('type of source').should('be supported').butWas(source);
        }
        return Folder.newInstance(
            itemId,
            filename,
            containerId,
            ImmutableSet.of(driveItem.files.map((driveFile) => {
              const driveId = driveFile.summary.source.getId();
              const itemId = sourceItemIdToItemIdMap.get(driveId);
              if (!itemId) {
                throw Errors.assert(`itemId for ${driveId}`).shouldExist().butNot();
              }
              return itemId;
            })),
            source);
      case ApiFileType.PROCESSOR:
        return ProcessorFile.newInstance(itemId, filename, containerId, content, source);
      case ApiFileType.TEMPLATE:
        return TemplateFile.newInstance(itemId, filename, containerId, content, source);
      case ApiFileType.UNKNOWN:
        return UnknownFile.newInstance(itemId, filename, containerId, source);
      default:
        throw assertUnreachable(type);
    }
  }

  /**
   * @param id ID of the item to delete
   * @return Promise that will be resolved when all the items have been deleted.
   */
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
    if (!(parent instanceof EditableFolder)) {
      return;
    }

    const promises: Promise<void>[] = [];
    if (item instanceof Folder) {
      promises.push(...item.getItems().mapItem((itemId) => this.deleteItem(itemId)));
    }

    promises.push(this.save(parent.setItems(parent.getItems().delete(id))));
    await Promise.all(promises);
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

  async getPath(id: string, suffixes: string[] = []): Promise<AbsolutePath | null> {
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

  async getRootFolder(): Promise<EditableFolder> {
    const project = await this.projectService_.get();
    const rootFolderId = project.getRootFolderId();
    const rootFolder = await this.getItem(rootFolderId);
    if (rootFolder instanceof EditableFolder) {
      return rootFolder;
    }

    const newRootFolder = EditableFolder.newInstance(
        rootFolderId,
        '(root)',
        null,
        ImmutableSet.of([]),
        ThothSource.newInstance());
    await this.save(newRootFolder);
    return newRootFolder;
  }

  async newId(): Promise<string> {
    return this.itemsGraph_.generateId();
  }

  async recursiveCreate(driveTree: TreeMap<string, ApiFile<Source>>, containerId: string):
      Promise<TreeMap<string, Item>> {
    const idPromises = driveTree.preOrder()
        .map(async (node) => {
          const itemId = await this.newId();
          const sourceId = node.getValue().summary.source.getId();
          return [sourceId, itemId] as [string, string];
        });
    const sourceIdToItemIdMap = ImmutableMap.of(await Promise.all([...idPromises]));

    return driveTree.map((node, _, parent) => {
      const value = node.getValue();
      const driveId = value.summary.source.getId();
      const itemId = sourceIdToItemIdMap.get(driveId)!;
      const parentItemId = parent ?
          sourceIdToItemIdMap.get(parent.getValue().summary.source.getId())! :
          containerId;
      return [itemId, this.createItem_(parentItemId, value, sourceIdToItemIdMap)];
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
    (itemsGraph, projectService, sourceService) => {
      return new ItemService(itemsGraph, projectService, sourceService);
    },
    $items,
    $projectService,
    $sourceService);
