/**
 * Handles access to the Drive API, converting Drive API format to Thoth data format.
 */
import { InstanceofType } from 'external/gs_tools/src/check';
import { Graph, staticId } from 'external/gs_tools/src/graph';
import { ImmutableList, ImmutableSet, Iterables } from 'external/gs_tools/src/immutable';

import { MetadataFile } from '.';
import { DriveFolder } from '../data/drive-folder';
import { $itemService, ItemService } from '../data/item-service';
import { MarkdownFile } from '../data/markdown-file';
import { UnknownFile } from '../data/unknown-file';
import { ApiDriveFile, ApiDriveType, DriveSource, DriveStorage, Source } from '../datasource';


type SupportedFile = MarkdownFile | UnknownFile;
type SupportedItem = SupportedFile | DriveFolder;

export class DriveService {
  constructor(private readonly itemService_: ItemService) { }

  private createFile_(
      id: string,
      containerId: string,
      driveItem: ApiDriveFile,
      source: Source): SupportedFile {
    const {type, name: filename} = driveItem.summary;
    const content = driveItem.content || '';
    switch (type) {
      case ApiDriveType.MARKDOWN:
        return MarkdownFile.newInstance(id, filename, containerId, content, source);
      case ApiDriveType.YAML:
        return MetadataFile.newInstance(id, filename, containerId, content, source);
      default:
        return UnknownFile.newInstance(id, filename, containerId, source);
    }
  }

  async recursiveGet(source: DriveSource, containerId: string):
      Promise<ImmutableList<SupportedItem>> {
    const driveId = source.getDriveId();
    const apiDriveItem = await DriveStorage.read(driveId);
    if (!apiDriveItem) {
      return ImmutableList.of([]);
    }

    const {type: apiType, name: filename} = apiDriveItem.summary;

    const id = await this.itemService_.newId();

    if (apiType !== ApiDriveType.FOLDER) {
      const newFile = this.createFile_(id, containerId, apiDriveItem, source);
      return ImmutableList.of([newFile]);
    }

    const contentPromises = apiDriveItem.files.map((file) => {
      return this.recursiveGet(file.summary.source, id);
    });
    const contents = await Promise.all(contentPromises);
    const contentsToAddAsChild: SupportedItem[] = [];
    for (const content of Iterables.flatten<SupportedItem>(contents)) {
      if (content.getParentId() === id) {
        contentsToAddAsChild.push(content);
      }
    }
    const newFolder = DriveFolder.newInstance(
        id,
        filename,
        containerId,
        ImmutableSet.of(contentsToAddAsChild.map((file) => file.getId())),
        source);

    let newItems = ImmutableList.of<SupportedItem>([newFolder]);
    for (const content of contents) {
      newItems = newItems.addAll(content);
    }
    return newItems;
  }
}

export const $driveService = staticId('driveService', InstanceofType(DriveService));
Graph.registerProvider(
    $driveService,
    (itemService) => {
      return new DriveService(itemService);
    },
    $itemService);
