import { assert, Fakes, TestBase } from '../test-base';
TestBase.setup();

import { DriveFile } from '../data/drive-file';
import { DriveFolder } from '../data/drive-folder';
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
  let mockItemService: any;
  let service: DriveService;

  beforeEach(() => {
    mockItemService = jasmine.createSpyObj('ItemService', ['newId']);
    mockItemService.newId.and.callFake(() => `${Math.random()}`);
    service = new DriveService(mockItemService);
  });

  describe('recursiveGet', () => {
    it(`should recursively add the folder contents`, async () => {
      const containerPath = 'containerPath';

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

      const rootItem = {
        files: [
          {
            content: content1,
            files: [],
            summary: createDriveSummary('id1', name1, ApiDriveType.UNKNOWN),
          },
          {
            files: [
              {
                content: content21,
                files: [],
                summary: createDriveSummary('id21', name21, ApiDriveType.MARKDOWN),
              },
              {
                content: content22,
                files: [],
                summary: createDriveSummary('id22', name22, ApiDriveType.MARKDOWN),
              },
            ],
            summary: createDriveSummary('idSub', nameSub, ApiDriveType.FOLDER),
          },
        ],
        summary: createDriveSummary('idRoot', nameRoot, ApiDriveType.FOLDER),
      };

      Fakes.build(spyOn(DriveStorage, 'read'))
          .when(idRoot).resolve(rootItem)
          .when(id1).resolve(rootItem.files[0])
          .when(idSub).resolve(rootItem.files[1])
          .when(id21).resolve(rootItem.files[1].files[0])
          .when(id22).resolve(rootItem.files[1].files[1]);

      const [rootFolder, file1, subFolder, file21, file22] =
          await service.recursiveGet(DriveSource.newInstance(idRoot), containerPath);

      assert(rootFolder.getSource().getDriveId()).to.equal(idRoot);
      assert(rootFolder.getName()).to.equal(nameRoot);
      assert(rootFolder.getParentId()).to.equal(containerPath);
      assert((rootFolder as DriveFolder).getItems()).to
          .haveElements([file1.getId(), subFolder.getId()]);

      assert(file1.getSource().getDriveId()).to.equal(id1);
      assert(file1.getName()).to.equal(name1);
      assert(file1.getParentId()).to.equal(rootFolder.getId());
      assert((file1 as DriveFile).getContent()).to.equal(content1);

      assert(subFolder.getSource().getDriveId()).to.equal(idSub);
      assert(subFolder.getName()).to.equal(nameSub);
      assert(subFolder.getParentId()).to.equal(rootFolder.getId());
      assert((subFolder as DriveFolder).getItems()).to
          .haveElements([file21.getId(), file22.getId()]);

      assert(file21.getSource().getDriveId()).to.equal(id21);
      assert(file21.getName()).to.equal(name21);
      assert(file21.getParentId()).to.equal(subFolder.getId());
      assert((file21 as DriveFile).getContent()).to.equal(content21);

      assert(file22.getSource().getDriveId()).to.equal(id22);
      assert(file22.getName()).to.equal(name22);
      assert(file22.getParentId()).to.equal(subFolder.getId());
      assert((file22 as DriveFile).getContent()).to.equal(content22);
    });

    it(`should handle files correctly`, async () => {
      const name = 'name';
      const id = 'id';
      const content = 'content';

      const addedItem = {
        content: content,
        files: [],
        summary: {id, name, type: ApiDriveType.MARKDOWN},
      };
      spyOn(DriveStorage, 'read').and.returnValue(Promise.resolve(addedItem));

      const containerId = 'containerId';

      const [file] = await service.recursiveGet(DriveSource.newInstance(id), containerId);
      assert(file.getSource().getDriveId()).to.equal(id);
      assert(file.getName()).to.equal(name);
      assert(file.getParentId()).to.equal(containerId);
      assert((file as DriveFile).getContent()).to.equal(content);
      assert(DriveStorage.read).to.haveBeenCalledWith(id);
    });

    it(`should return empty list if the item cannot be found`, async () => {
      spyOn(DriveStorage, 'read').and.returnValue(null);

      assert(await service.recursiveGet(DriveSource.newInstance('idRoot'), 'containerPath'))
          .to.haveElements([]);
    });
  });
});
