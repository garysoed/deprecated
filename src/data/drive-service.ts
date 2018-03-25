/**
 * Handles access to the Drive API, converting Drive API format to Thoth data format.
 */
import { InstanceofType } from 'external/gs_tools/src/check';
import { Graph, staticId } from 'external/gs_tools/src/graph';
import { TreeMap } from 'external/gs_tools/src/immutable';

import { ApiDriveFile, DriveSource, DriveStorage } from '../datasource';

export class DriveService {
  async recursiveGet(source: DriveSource): Promise<TreeMap<string, ApiDriveFile> | null> {
    const driveId = source.getDriveId();
    const apiDriveItem = await DriveStorage.read(driveId);
    if (!apiDriveItem) {
      return null;
    }

    let rootNode = TreeMap.of<string, ApiDriveFile>(apiDriveItem);
    const children = await Promise
        .all(apiDriveItem.files.map((file) => this.recursiveGet(file.summary.source)));

    for (const childNode of children) {
      if (!childNode) {
        continue;
      }

      rootNode = rootNode.set(childNode.getValue().summary.source.getDriveId(), childNode);
    }
    return rootNode;
  }
}

export const $driveService = staticId('driveService', InstanceofType(DriveService));
Graph.registerProvider($driveService, () => new DriveService());
