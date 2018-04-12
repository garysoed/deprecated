import { assert, TestBase } from '../test-base';
TestBase.setup();

import { TreeMap } from 'external/gs_tools/src/immutable';

import { SourceService } from '../data';
import { DriveSource, ThothSource } from '../datasource';


describe('data.SourceService', () => {
  let service: SourceService;
  let mockDriveService: any;

  beforeEach(() => {
    mockDriveService = jasmine.createSpyObj('DriveService', ['recursiveGet']);
    service = new SourceService(mockDriveService);
  });

  describe('recursiveGet', () => {
    it(`should handle DriveSource correctly`, async () => {
      const source = DriveSource.newInstance('driveId');
      const tree = TreeMap.of(null);
      mockDriveService.recursiveGet.and.returnValue(Promise.resolve(tree));

      assert(await service.recursiveGet(source)).to.equal(tree);
      assert(mockDriveService.recursiveGet).to.haveBeenCalledWith(source);
    });

    it(`should reject if source is unhandled`, async () => {
      const source = ThothSource.newInstance();

      await assert(service.recursiveGet(source)).to.rejectWithError(/Unhandled/);
    });
  });
});
