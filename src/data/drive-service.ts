/**
 * Handles access to the Drive API, converting Drive API format to Thoth data format.
 */
import { ImmutableList, ImmutableSet, Iterables } from 'external/gs_tools/src/immutable';

import { DriveFile } from '../data/drive-file';
import { DriveFolder } from '../data/drive-folder';
import { convertToItemType } from '../data/file-type';
import { Item } from '../data/item';
import { ApiDriveType, DriveStorage } from '../import';

export class DriveServiceImpl {
  async recursiveGet(driveId: string, containerId: string):
      Promise<ImmutableList<DriveFile | DriveFolder>> {
    const apiDriveItem = await DriveStorage.read(driveId);
    const {type: apiType, name: apiName} = apiDriveItem.summary;

    if (apiType !== ApiDriveType.FOLDER) {
      const newFile = DriveFile.newInstance(
          Item.newId(),
          apiName,
          containerId,
          convertToItemType(apiType),
          apiDriveItem.content || '',
          driveId);
      return ImmutableList.of([newFile]);
    }

    const id = Item.newId();
    const contentPromises = apiDriveItem.files.map((file) => {
      return this.recursiveGet(file.summary.id, id);
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

export const DriveService = new DriveServiceImpl();
