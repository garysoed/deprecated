import { assert, Mocks, TestBase } from '../test-base';
TestBase.setup();

import { FolderImpl } from '../data/folder-impl';
import { providesSelectedFolder, ROOT_ITEM } from '../main/selected-folder-graph';


describe('main.providesSelectedFolder', () => {
  describe('providesSelectedFolder', () => {
    it(`should resolve with the correct folder`, async () => {
      const location = 'location';
      const item = Mocks.object('item');
      Object.setPrototypeOf(item, FolderImpl.prototype);
      const mockGraph = jasmine.createSpyObj('Graph', ['get']);
      mockGraph.get.and.returnValue(Promise.resolve(item));

      assert(await providesSelectedFolder(location, mockGraph)).to.equal(item);
      assert(mockGraph.get).to.haveBeenCalledWith(location);
    });

    it(`should resolve with ROOT_ITEM if item is not a folder`, async () => {
      const location = 'location';
      const item = Mocks.object('item');
      const mockGraph = jasmine.createSpyObj('Graph', ['get']);
      mockGraph.get.and.returnValue(Promise.resolve(item));

      assert(await providesSelectedFolder(location, mockGraph)).to.equal(ROOT_ITEM);
      assert(mockGraph.get).to.haveBeenCalledWith(location);
    });
  });
});
