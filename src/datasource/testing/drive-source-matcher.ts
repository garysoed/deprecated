import { ITestSetup, Matcher, matcherTestSetup } from 'external/gs_tools/src/testing';

import { DriveSource } from '../drive-source';

export class DriveSourceMatcher implements Matcher {
  static readonly testSetup: ITestSetup = matcherTestSetup(DriveSourceMatcher);

  constructor(private readonly expectedDriveId_: string) { }

  matches(target: any): boolean {
    if (!(target instanceof DriveSource)) {
      return false;
    }

    return target.getId() === this.expectedDriveId_;
  }

  static with(driveId: string): DriveSource {
    return new DriveSourceMatcher(driveId) as any;
  }
}
