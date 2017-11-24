import { assert, Mocks, TestBase } from '../test-base';
TestBase.setup();

import { Graph } from 'external/gs_tools/src/graph';

import { Folder, ItemService } from '../data';
import { providesSelectedItem, ROOT_PATH } from '../data/selected-item-graph';


describe('main.providesSelectedFolder', () => {
  describe('providesSelectedFolder', () => {
    it(`should resolve with the correct folder`, async () => {
      const path = 'path';

      const item = Mocks.object('item');
      Object.setPrototypeOf(item, Folder.prototype);
      spyOn(ItemService, 'getItemByPath').and.returnValue(Promise.resolve(item));

      const time = Graph.getTimestamp();

      assert(await providesSelectedItem(path, time)).to.equal(item);
      assert(ItemService.getItemByPath).to.haveBeenCalledWith(time, path);
    });

    it(`should redirect to ROOT_PATH and resolve with saved root folder if item doesn't exist ` +
        `and path is not ROOT_PATH`, async () => {
      const path = 'path';

      const rootFolder = Mocks.object('rootFolder');
      spyOn(ItemService, 'getRootFolder').and.returnValue(Promise.resolve(rootFolder));

      spyOn(ItemService, 'getItemByPath').and.returnValue(Promise.resolve(null));

      const time = Graph.getTimestamp();

      assert(await providesSelectedItem(path, time)).to.equal(rootFolder);
      assert(ItemService.getItemByPath).to.haveBeenCalledWith(time, path);
      assert(ItemService.getRootFolder).to.haveBeenCalledWith(time);
      assert(window.location.hash).to.equal(`#${ROOT_PATH}`);
    });

    it(`should redirect to ROOT_PATH and resolve with saved root folder if item doesn't exist and` +
        ` path is ROOT_PATH`, async () => {
      const path = ROOT_PATH;

      const rootFolder = Mocks.object('rootFolder');
      spyOn(ItemService, 'getRootFolder').and.returnValue(Promise.resolve(rootFolder));

      spyOn(ItemService, 'getItemByPath').and.returnValue(Promise.resolve(null));

      const time = Graph.getTimestamp();

      assert(await providesSelectedItem(path, time)).to.equal(rootFolder);
      assert(ItemService.getItemByPath).to.haveBeenCalledWith(time, path);
      assert(ItemService.getRootFolder).to.haveBeenCalledWith(time);
    });

    it(`should resolve with root folder and navigate to ROOT_PATH if location is not specified`,
        async () => {
      const rootFolder = Mocks.object('rootFolder');
      spyOn(ItemService, 'getRootFolder').and.returnValue(Promise.resolve(rootFolder));

      const time = Graph.getTimestamp();

      assert(await providesSelectedItem('', time)).to.equal(rootFolder);
      assert(ItemService.getRootFolder).to.haveBeenCalledWith(time);
    });
  });
});
