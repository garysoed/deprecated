import { assert, Fakes, Matchers, Mocks, TestBase } from '../test-base';
TestBase.setup();

import { ApiDriveType } from '../import/drive';
import { DRIVE_FOLDER_MIMETYPE, DriveStorageImpl } from '../import/drive-storage';


describe('import.DriveStorage', () => {
  let mockDriveLibrary: any;
  let storage: DriveStorageImpl;

  beforeEach(() => {
    mockDriveLibrary = jasmine.createSpyObj('DriveLibrary', ['get']);
    storage = new DriveStorageImpl(mockDriveLibrary);
  });

  describe('createListConfig_', () => {
    it(`should return the correct config`, () => {
      const filename = 'filename';
      const parentId = 'parentId';
      const mimeType1 = 'mimeType1';
      const mimeType2 = 'mimeType2';
      const matchRegex =
          /name contains 'filename' and \(.* 'mimeType1' or .* 'mimeType2'\) and 'parentId' .*/;

      assert(storage['createListConfig_']({filename, mimeTypes: [mimeType1, mimeType2], parentId}))
          .to.equal(Matchers.objectContaining({
            q: Matchers.stringMatching(matchRegex),
          }));
    });

    it(`should return the correct config if filename isn't specified`, () => {
      assert(storage['createListConfig_']()).to.equal(Matchers.objectContaining({q: ''}));
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
            {id: id1, name: name1, mimeType: 'text/x-markdown'},
            {id: id2, name: name2, mimeType: 'text/plain'},
          ],
        },
      }));
      mockDriveLibrary.get.and.returnValue(Promise.resolve({files: mockFiles}));

      assert(await storage.list()).to.haveElements([
        {id: id1, name: name1, type: ApiDriveType.MARKDOWN},
        {id: id2, name: name2, type: ApiDriveType.UNKNOWN},
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

  describe('read', () => {
    it(`should handle folders correctly`, async () => {
      const id = 'id';
      const files = Mocks.object('files');

      spyOn(storage, 'readFolderContents_').and.returnValue(Promise.resolve(files));

      const mockFiles = jasmine.createSpyObj('Files', ['get']);
      mockFiles.get.and.returnValue(Promise.resolve({
        result: {id, mimeType: DRIVE_FOLDER_MIMETYPE},
      }));
      mockDriveLibrary.get.and.returnValue(Promise.resolve({files: mockFiles}));

      await assert(storage.read(id)).to.resolveWith({
        files,
        summary: Matchers.objectContaining({
          id,
        }),
      });
      assert(storage['readFolderContents_']).to.haveBeenCalledWith(id);
      assert(mockFiles.get).to.haveBeenCalledWith({fileId: id});
    });

    it(`should handle markdown files correctly`, async () => {
      const id = 'id';
      const content = 'content';

      spyOn(storage, 'readFileContent_').and.returnValue(Promise.resolve(content));

      const mockFiles = jasmine.createSpyObj('Files', ['get']);
      mockFiles.get.and.returnValue(Promise.resolve({
        result: {id, mimeType: 'text/x-markdown'},
      }));
      mockDriveLibrary.get.and.returnValue(Promise.resolve({files: mockFiles}));

      await assert(storage.read(id)).to.resolveWith({
        content,
        files: [],
        summary: Matchers.objectContaining({
          id,
        }),
      });
      assert(storage['readFileContent_']).to.haveBeenCalledWith(Matchers.objectContaining({id}));
      assert(mockFiles.get).to.haveBeenCalledWith({fileId: id});
    });

    it(`should handle unknown file type correctly`, async () => {
      const id = 'id';

      const mockFiles = jasmine.createSpyObj('Files', ['get']);
      mockFiles.get.and.returnValue(Promise.resolve({
        result: {id, mimeType: 'text/plain'},
      }));
      mockDriveLibrary.get.and.returnValue(Promise.resolve({files: mockFiles}));

      await assert(storage.read(id)).to.resolveWith({
        files: [],
        summary: Matchers.objectContaining({
          id,
        }),
      });
      assert(mockFiles.get).to.haveBeenCalledWith({fileId: id});
    });
  });

  describe('readFileContent_', () => {
    it(`should resolve correctly for text file type`, async () => {
      const id = 'id';
      const body = 'body';
      const mockFiles = jasmine.createSpyObj('Files', ['get']);
      mockFiles.get.and.returnValue(Promise.resolve({body}));
      mockDriveLibrary.get.and.returnValue(Promise.resolve({files: mockFiles}));

      await assert(storage['readFileContent_']({id, type: ApiDriveType.MARKDOWN} as any))
          .to.resolveWith(body);
      assert(mockFiles.get).to.haveBeenCalledWith({alt: 'media', fileId: id});
    });

    it(`should resolve with null if the type is FOLDER`, async () => {
      await assert(storage['readFileContent_']({id: 'id', type: ApiDriveType.FOLDER} as any))
          .to.resolveWith(null);
    });

    it(`should resolve with null if the type is UNKNOWN`, async () => {
      await assert(storage['readFileContent_']({id: 'id', type: ApiDriveType.UNKNOWN} as any))
          .to.resolveWith(null);
    });
  });

  describe('readFolderContents_', () => {
    it(`should return the correct content`, async () => {
      const folderId = 'folderId';
      const id1 = 'id1';
      const id2 = 'id2';
      const file1 = Mocks.object('file1');
      const file2 = Mocks.object('file2');
      Fakes.build(spyOn(storage, 'read'))
          .when(id1).resolve(file1)
          .when(id2).resolve(file2);

      const mockFiles = jasmine.createSpyObj('Files', ['list']);
      mockFiles.list.and.returnValue(Promise.resolve({result: {files: [{id: id1}, {id: id2}]}}));
      mockDriveLibrary.get.and.returnValue(Promise.resolve({files: mockFiles}));

      const config = Mocks.object('config');
      spyOn(storage, 'createListConfig_').and.returnValue(config);

      await assert(storage['readFolderContents_'](folderId)).to.resolveWith([file1, file2]);
      assert(storage.read).to.haveBeenCalledWith(id1);
      assert(storage.read).to.haveBeenCalledWith(id2);
      assert(mockFiles.list).to.haveBeenCalledWith(config);
      assert(storage['createListConfig_']).to.haveBeenCalledWith({parentId: folderId});
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
            {id: id1, name: name1, mimeType: 'text/x-markdown'},
            {id: id2, name: name2, mimeType: 'text/plain'},
          ],
        },
      }));
      mockDriveLibrary.get.and.returnValue(Promise.resolve({files: mockFiles}));

      const config = Mocks.object('config');
      spyOn(storage, 'createListConfig_').and.returnValue(config);

      assert(await storage.search(filename)).to.haveElements([
        {id: id1, name: name1, type: ApiDriveType.MARKDOWN},
        {id: id2, name: name2, type: ApiDriveType.UNKNOWN},
      ]);
      assert(storage['createListConfig_']).to
          .haveBeenCalledWith(Matchers.objectContaining({filename}));
      assert(mockFiles.list).to.haveBeenCalledWith(config);
    });
  });
});
