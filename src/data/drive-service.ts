/**
 * Handles access to the Drive API, converting Drive API format to Thoth data format.
 */
import { InstanceofType } from 'external/gs_tools/src/check';
import { Graph, staticId } from 'external/gs_tools/src/graph';
import { ImmutableList, ImmutableSet, Iterables } from 'external/gs_tools/src/immutable';

import { DriveFile } from '../data/drive-file';
import { DriveFolder } from '../data/drive-folder';
import { convertToItemType } from '../data/file-type';
import { $itemService, ItemService } from '../data/item-service';
import { ApiDriveType, DriveStorage } from '../datasource';

export class DriveService {
  constructor(private readonly itemService_: ItemService) { }

  async recursiveGet(driveId: string, containerId: string):
      Promise<ImmutableList<DriveFile | DriveFolder>> {
    const apiDriveItem = await DriveStorage.read(driveId);
    if (!apiDriveItem) {
      return ImmutableList.of([]);
    }

    const {type: apiType, name: apiName} = apiDriveItem.summary;

    const id = await this.itemService_.newId();

    if (apiType !== ApiDriveType.FOLDER) {
      const newFile = DriveFile.newInstance(
          id,
          apiName,
          containerId,
          convertToItemType(apiType, apiName),
          apiDriveItem.content || '',
          driveId);
      return ImmutableList.of([newFile]);
    }

    const contentPromises = apiDriveItem.files.map((file) => {
      return this.recursiveGet(file.summary.source.getDriveId(), id);
    });
    const contents = await Promise.all(contentPromises);
    const contentsToAddAsChild: (DriveFile | DriveFolder)[] = [];
    for (const content of Iterables.flatten<DriveFile | DriveFolder>(contents)) {
      if (content.getParentId() === id) {
        contentsToAddAsChild.push(content);
      }
    }
    const newFolder = DriveFolder.newInstance(
        id,
        apiName,
        containerId,
        ImmutableSet.of(contentsToAddAsChild.map((file) => file.getId())),
        driveId);

    let newItems = ImmutableList.of<DriveFile | DriveFolder>([newFolder]);
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
