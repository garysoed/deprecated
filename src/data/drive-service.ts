/**
 * Handles access to the Drive API, converting Drive API format to Thoth data format.
 */
import { ImmutableList, ImmutableSet } from 'external/gs_tools/src/immutable';

import { DriveFile } from '../data/drive-file';
import { DriveFolder } from '../data/drive-folder';
import { convertToItemType } from '../data/file-type';
import { ApiDriveType, DriveStorage } from '../import';

export class DriveServiceImpl {
  async recursiveGet(driveId: string, containerPath: string):
      Promise<ImmutableList<DriveFile | DriveFolder>> {
    const apiDriveItem = await DriveStorage.read(driveId);
    const {type: apiType, name: apiName} = apiDriveItem.summary;
    const id = `${containerPath}/${apiName}`;

    if (apiType !== ApiDriveType.FOLDER) {
      const newFile = DriveFile.newInstance(
          id,
          apiName,
          containerPath,
          convertToItemType(apiType),
          apiDriveItem.content || '',
          driveId);
      return ImmutableList.of([newFile]);
    }

    const newFolder = DriveFolder.newInstance(
        id,
        apiName,
        containerPath,
        ImmutableSet
            .of(apiDriveItem.files)
            .mapItem((file) => `${id}/${file.summary.name}`),
        driveId);
    const contentPromises = apiDriveItem.files.map((file) => {
      return this.recursiveGet(file.summary.id, id);
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
