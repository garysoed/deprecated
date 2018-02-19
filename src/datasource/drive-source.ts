import { Serializable } from 'external/gs_tools/src/data';
import { DataModels, field } from 'external/gs_tools/src/datamodel';
import { StringParser } from 'external/gs_tools/src/parse';

import { ImmutableMap } from 'external/gs_tools/src/immutable';
import { Source } from '../datasource/source';

@Serializable('datasource.DriveSource')
export abstract class DriveSource extends Source {
  @field('driveId', StringParser) readonly driveId_!: string;

  abstract getDriveId(): string;

  getSearchIndex(): string {
    return this.driveId_;
  }

  toString(): string {
    return `DriveSource(${this.driveId_})`;
  }

  static newInstance(driveId: string): DriveSource {
    return DataModels.newInstance(
        DriveSource,
        ImmutableMap.of([
          ['driveId_', driveId],
        ]));
  }
}
