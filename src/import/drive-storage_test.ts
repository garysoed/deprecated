import { assert, Matchers, Mocks, TestBase } from '../test-base';
TestBase.setup();

import { DriveStorageImpl } from '../import/drive-storage';


describe('import.DriveStorage', () => {
  let mockDriveLibrary: any;
  let storage: DriveStorageImpl;

  beforeEach(() => {
    mockDriveLibrary = jasmine.createSpyObj('DriveLibrary', ['get']);
    storage = new DriveStorageImpl(mockDriveLibrary);
  });

  describe('createListConfig_', () => {
    it(`should return the correct config`, () => {
      assert(storage['createListConfig_']('filename')).to.equal(Matchers.objectContaining({
        q: Matchers.stringMatching(/mimeType .* and name contains 'filename'/),
      }));
    });

    it(`should return the correct config if filename isn't specified`, () => {
      assert(storage['createListConfig_']()).to.equal(Matchers.objectContaining({
        q: `mimeType = 'application/vnd.google-apps.folder'`,
      }));
    });
  });

  describe('list', () => {
    it(`should return the correct files`, async () => {
      const id1 = 'id1';
      const id2 = 'id2';
      const name1 = 'name1';
      const name2 = 'name2';
      const mockFiles = jasmine.createSpyObj('Files', ['list']);
      mockFiles.list.and.returnValue(Promise.resolve({
        result: {
          files: [
            {id: id1, name: name1},
            {id: id2, name: name2},
          ],
        },
      }));
      mockDriveLibrary.get.and.returnValue(Promise.resolve({files: mockFiles}));

      assert(await storage.list()).to.haveElements([
        {id: id1, name: name1},
        {id: id2, name: name2},
      ]);
    });
  });

  describe('listIds', () => {
    it(`should return the correct IDs`, async () => {
      const id1 = 'id1';
      const id2 = 'id2';
      const mockFiles = jasmine.createSpyObj('Files', ['list']);
      mockFiles.list.and.returnValue(Promise.resolve({
        result: {
          files: [
            {id: id1, name: 'name1'},
            {id: id2, name: 'name2'},
          ],
        },
      }));
      mockDriveLibrary.get.and.returnValue(Promise.resolve({files: mockFiles}));

      assert(await storage.listIds()).to.haveElements([id1, id2]);
    });
  });

  describe('search', () => {
    it(`should return the correct files`, async () => {
      const filename = 'filename';
      const id1 = 'id1';
      const id2 = 'id2';
      const name1 = 'name1';
      const name2 = 'name2';
      const mockFiles = jasmine.createSpyObj('Files', ['list']);
      mockFiles.list.and.returnValue(Promise.resolve({
        result: {
          files: [
            {id: id1, name: name1},
            {id: id2, name: name2},
          ],
        },
      }));
      mockDriveLibrary.get.and.returnValue(Promise.resolve({files: mockFiles}));

      const config = Mocks.object('config');
      spyOn(storage, 'createListConfig_').and.returnValue(config);

      assert(await storage.search(filename)).to.haveElements([
        {id: id1, name: name1},
        {id: id2, name: name2},
      ]);
      assert(storage['createListConfig_']).to.haveBeenCalledWith(filename);
      assert(mockFiles.list).to.haveBeenCalledWith(config);
    });
  });
});
