import { assert, Fakes, TestBase } from '../test-base';
TestBase.setup();

import { DriveService } from '../data/drive-service';
import { ApiDriveType, DriveSource, DriveStorage } from '../datasource';

function createDriveSummary(id: string, name: string, type: ApiDriveType):
    {name: string, source: DriveSource, type: ApiDriveType} {
  return {
    name,
    source: DriveSource.newInstance(id),
    type,
  };
}

describe('data.DriveServiceImpl', () => {
  let service: DriveService;

  beforeEach(() => {
    service = new DriveService();
  });

  describe('recursiveGet', () => {
    it(`should recursively add the folder contents`, async () => {
      const nameRoot = 'nameRoot';
      const idRoot = 'idRoot';

      const name1 = 'name1';
      const id1 = 'id1';
      const content1 = 'content1';

      const nameSub = 'nameSub';
      const idSub = 'idSub';

      const name21 = 'name21';
      const id21 = 'id21';
      const content21 = 'content21';

      const name22 = 'name22';
      const id22 = 'id22';
      const content22 = 'content22';

      const apiItem1 = {
        content: content1,
        files: [],
        summary: createDriveSummary(id1, name1, ApiDriveType.UNKNOWN),
      };
      const apiItem21 = {
        content: content21,
        files: [],
        summary: createDriveSummary(id21, name21, ApiDriveType.MARKDOWN),
      };
      const apiItem22 = {
        content: content22,
        files: [],
        summary: createDriveSummary(id22, name22, ApiDriveType.MARKDOWN),
      };
      const apiItemSub = {
        files: [apiItem21, apiItem22],
        summary: createDriveSummary(idSub, nameSub, ApiDriveType.FOLDER),
      };
      const rootItem = {
        files: [apiItem1, apiItemSub],
        summary: createDriveSummary(idRoot, nameRoot, ApiDriveType.FOLDER),
      };

      Fakes.build(spyOn(DriveStorage, 'read'))
          .when(idRoot).resolve(rootItem)
          .when(id1).resolve(rootItem.files[0])
          .when(idSub).resolve(rootItem.files[1])
          .when(id21).resolve(rootItem.files[1].files[0])
          .when(id22).resolve(rootItem.files[1].files[1]);

      const rootNode = (await service.recursiveGet(DriveSource.newInstance(idRoot)))!;

      assert(rootNode.getValue()).to.equal(rootItem);

      assert(rootNode.getChildren().size()).to.equal(2);
      assert(rootNode.getChildNode(id1)!.getValue()).to.equal(apiItem1);
      assert(rootNode.getChildNode(idSub)!.getValue()).to.equal(apiItemSub);

      const subNode = rootNode.getChildNode(idSub)!;
      assert(subNode.getChildren().size()).to.equal(2);
      assert(subNode.getChildNode(id21)!.getValue()).to.equal(apiItem21);
      assert(subNode.getChildNode(id22)!.getValue()).to.equal(apiItem22);
    });

    it(`should return null if the item cannot be found`, async () => {
      spyOn(DriveStorage, 'read').and.returnValue(null);

      assert(await service.recursiveGet(DriveSource.newInstance('idRoot'))).to.beNull();
    });
  });
});
