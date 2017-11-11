import { ImmutableList, ImmutableSet } from 'external/gs_tools/src/immutable';

import { DriveFile } from '../data/drive-file';
import { DriveFolder } from '../data/drive-folder';
import { convertToItemType } from '../data/item-type';
import { ApiDriveType } from '../import/drive';
import { DriveStorage } from '../import/drive-storage';

export class DriveServiceImpl {
  async recursiveGet(id: string, containerPath: string):
      Promise<ImmutableList<DriveFile | DriveFolder>> {
    const apiDriveItem = await DriveStorage.read(id);
    const {type: apiType, name: apiName} = apiDriveItem.summary;
    const driveItemId = `${containerPath}/${apiName}`;

    if (apiType !== ApiDriveType.FOLDER) {
      const newFile = DriveFile.newInstance(
          driveItemId,
          apiName,
          containerPath,
          convertToItemType(apiType),
          apiDriveItem.content || '');
      return ImmutableList.of([newFile]);
    }

    const newFolder = DriveFolder.newInstance(
        driveItemId,
        apiName,
        containerPath,
        ImmutableSet
            .of(apiDriveItem.files)
            .mapItem((file) => `${driveItemId}/${file.summary.name}`));
    const contentPromises = apiDriveItem.files.map((file) => {
      return this.recursiveGet(file.summary.id, driveItemId);
    });
    const contents = await Promise.all(contentPromises);

    let newItems = ImmutableList.of<DriveFile | DriveFolder>([newFolder]);
    for (const content of contents) {
      newItems = newItems.addAll(content);
    }
    return newItems;
  }
}

export const DriveService = new DriveServiceImpl();
