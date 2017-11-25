import { assert, Mocks, TestBase } from '../test-base';
TestBase.setup();

import { Folder } from '../data';
import { providesSelectedItem, ROOT_PATH } from '../data/selected-item-graph';


describe('main.providesSelectedItem', () => {
  describe('providesSelectedItem', () => {
    it(`should resolve with the correct folder`, async () => {
      const path = 'path';

      const item = Mocks.object('item');
      Object.setPrototypeOf(item, Folder.prototype);

      const mockItemService = jasmine.createSpyObj('ItemService', ['getItemByPath']);
      mockItemService.getItemByPath.and.returnValue(Promise.resolve(item));

      assert(await providesSelectedItem(path, mockItemService)).to.equal(item);
      assert(mockItemService.getItemByPath).to.haveBeenCalledWith(path);
    });

    it(`should redirect to ROOT_PATH and resolve with saved root folder if item doesn't exist ` +
        `and path is not ROOT_PATH`, async () => {
      const path = 'path';

      const rootFolder = Mocks.object('rootFolder');
      const mockItemService = jasmine.createSpyObj(
          'ItemService', ['getItemByPath', 'getRootFolder']);
      mockItemService.getRootFolder.and.returnValue(Promise.resolve(rootFolder));
      mockItemService.getItemByPath.and.returnValue(Promise.resolve(null));

      assert(await providesSelectedItem(path, mockItemService)).to.equal(rootFolder);
      assert(mockItemService.getItemByPath).to.haveBeenCalledWith(path);
      assert(mockItemService.getRootFolder).to.haveBeenCalledWith();
      assert(window.location.hash).to.equal(`#${ROOT_PATH}`);
    });

    it(`should redirect to ROOT_PATH and resolve with saved root folder if item doesn't exist and` +
        ` path is ROOT_PATH`, async () => {
      const path = ROOT_PATH;

      const rootFolder = Mocks.object('rootFolder');
      const mockItemService = jasmine.createSpyObj(
          'ItemService', ['getItemByPath', 'getRootFolder']);
      mockItemService.getRootFolder.and.returnValue(Promise.resolve(rootFolder));
      mockItemService.getItemByPath.and.returnValue(Promise.resolve(null));

      assert(await providesSelectedItem(path, mockItemService)).to.equal(rootFolder);
      assert(mockItemService.getItemByPath).to.haveBeenCalledWith(path);
      assert(mockItemService.getRootFolder).to.haveBeenCalledWith();
    });

    it(`should resolve with root folder and navigate to ROOT_PATH if location is not specified`,
        async () => {
      const rootFolder = Mocks.object('rootFolder');
      const mockItemService = jasmine.createSpyObj('ItemService', ['getRootFolder']);
      mockItemService.getRootFolder.and.returnValue(Promise.resolve(rootFolder));

      assert(await providesSelectedItem('', mockItemService)).to.equal(rootFolder);
      assert(mockItemService.getRootFolder).to.haveBeenCalledWith();
    });
  });
});
