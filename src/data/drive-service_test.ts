import { assert, Fakes, TestBase } from '../test-base';
TestBase.setup();

import { DriveFile } from '../data/drive-file';
import { DriveFolder } from '../data/drive-folder';
import { DriveServiceImpl } from '../data/drive-service';
import { ApiDriveType, DriveStorage } from '../import';

describe('data.DriveServiceImpl', () => {
  let service: DriveServiceImpl;

  beforeEach(() => {
    service = new DriveServiceImpl();
  });

  describe('recursiveGet', () => {
    it(`should recursively add the folder contents`, async () => {
      const containerPath = 'containerPath';

      const nameRoot = 'nameRoot';
      const idRoot = 'idRoot';
      const pathRoot = `${containerPath}/${nameRoot}`;

      const name1 = 'name1';
      const id1 = 'id1';
      const content1 = 'content1';
      const path1 = `${containerPath}/${nameRoot}/${name1}`;

      const nameSub = 'nameSub';
      const idSub = 'idSub';
      const pathSub = `${containerPath}/${nameRoot}/${nameSub}`;

      const name21 = 'name21';
      const id21 = 'id21';
      const content21 = 'content21';
      const path21 = `${containerPath}/${nameRoot}/${nameSub}/${name21}`;

      const name22 = 'name22';
      const id22 = 'id22';
      const content22 = 'content22';
      const path22 = `${containerPath}/${nameRoot}/${nameSub}/${name22}`;

      const rootItem = {
        files: [
          {
            content: content1,
            files: [],
            summary: {id: 'id1', name: name1, type: ApiDriveType.MARKDOWN},
          },
          {
            files: [
              {
                content: content21,
                files: [],
                summary: {id: 'id21', name: name21, type: ApiDriveType.MARKDOWN},
              },
              {
                content: content22,
                files: [],
                summary: {id: 'id22', name: name22, type: ApiDriveType.MARKDOWN},
              },
            ],
            summary: {id: 'idSub', name: nameSub, type: ApiDriveType.FOLDER},
          },
        ],
        summary: {id: 'idRoot', name: nameRoot, type: ApiDriveType.FOLDER},
      };

      Fakes.build(spyOn(DriveStorage, 'read'))
          .when(idRoot).resolve(rootItem)
          .when(id1).resolve(rootItem.files[0])
          .when(idSub).resolve(rootItem.files[1])
          .when(id21).resolve(rootItem.files[1].files[0])
          .when(id22).resolve(rootItem.files[1].files[1]);

      const [rootFolder, file1, subFolder, file21, file22] =
          await service.recursiveGet(idRoot, containerPath);

      assert(rootFolder.getId()).to.equal(pathRoot);
      assert(rootFolder.getDriveId()).to.equal(idRoot);
      assert(rootFolder.getName()).to.equal(nameRoot);
      assert(rootFolder.getParentId()).to.equal(containerPath);
      assert((rootFolder as DriveFolder).getItems()).to.haveElements([path1, pathSub]);

      assert(file1.getId()).to.equal(path1);
      assert(file1.getDriveId()).to.equal(id1);
      assert(file1.getName()).to.equal(name1);
      assert(file1.getParentId()).to.equal(pathRoot);
      assert((file1 as DriveFile).getContent()).to.equal(content1);

      assert(subFolder.getId()).to.equal(pathSub);
      assert(subFolder.getDriveId()).to.equal(idSub);
      assert(subFolder.getName()).to.equal(nameSub);
      assert(subFolder.getParentId()).to.equal(pathRoot);
      assert((subFolder as DriveFolder).getItems()).to.haveElements([path21, path22]);

      assert(file21.getId()).to.equal(path21);
      assert(file21.getDriveId()).to.equal(id21);
      assert(file21.getName()).to.equal(name21);
      assert(file21.getParentId()).to.equal(pathSub);
      assert((file21 as DriveFile).getContent()).to.equal(content21);

      assert(file22.getId()).to.equal(path22);
      assert(file22.getDriveId()).to.equal(id22);
      assert(file22.getName()).to.equal(name22);
      assert(file22.getParentId()).to.equal(pathSub);
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

      const [file] = await service.recursiveGet(id, containerId);
      assert(file.getId()).to.equal(`${containerId}/${name}`);
      assert(file.getDriveId()).to.equal(id);
      assert(file.getName()).to.equal(name);
      assert(file.getParentId()).to.equal(containerId);
      assert((file as DriveFile).getContent()).to.equal(content);
      assert(DriveStorage.read).to.haveBeenCalledWith(id);
    });
  });
});
