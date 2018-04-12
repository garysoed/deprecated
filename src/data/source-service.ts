import { InstanceofType } from 'external/gs_tools/src/check';
import { Graph, staticId } from 'external/gs_tools/src/graph';
import { TreeMap } from 'external/gs_tools/src/immutable';

import { $driveService, DriveService } from '../data/drive-service';
import { ApiFile, DriveSource, Source } from '../datasource';

export class SourceService {
  constructor(private readonly driveService_: DriveService) { }

  async recursiveGet(source: Source): Promise<TreeMap<string, ApiFile<Source>> | null> {
    if (source instanceof DriveSource) {
      return this.driveService_.recursiveGet(source);
    } else {
      throw new Error(`Unhandled source ${source}`);
    }
  }
}

export const $sourceService = staticId('SourceService', InstanceofType(SourceService));
Graph.registerProvider(
    $sourceService,
    (driveService) => {
      return new SourceService(driveService);
    },
    $driveService);
