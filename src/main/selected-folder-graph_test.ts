import { assert, Fakes, Mocks, TestBase } from '../test-base';
TestBase.setup();

import { FolderImpl } from '../data/folder-impl';
import { providesSelectedFolder, ROOT_ID, ROOT_ITEM } from '../main/selected-folder-graph';


describe('main.providesSelectedFolder', () => {
  describe('providesSelectedFolder', () => {
    it(`should resolve with the correct folder`, async () => {
      const id = 'id';
      const location = `${id}`;
      const item = Mocks.object('item');
      Object.setPrototypeOf(item, FolderImpl.prototype);

      const rootItem = Mocks.object('rootItem');
      Object.setPrototypeOf(rootItem, FolderImpl.prototype);

      const mockGraph = jasmine.createSpyObj('Graph', ['get']);
      Fakes.build(mockGraph.get)
          .when(id).resolve(item)
          .when(ROOT_ID).resolve(rootItem);

      assert(await providesSelectedFolder(location, mockGraph)).to.equal(item);
    });

    it(`should redirect to ROOT_ID and resolve with saved root folder if item is not a folder and` +
        ` ID is not ROOT_ID`, async () => {
      const id = 'id';
      const location = `${id}`;
      const item = Mocks.object('item');

      const mockGraph = jasmine.createSpyObj('Graph', ['get']);
      Fakes.build(mockGraph.get)
          .when(id).resolve(item);

      assert(await providesSelectedFolder(location, mockGraph)).to.equal(ROOT_ITEM);
      assert(window.location.hash).to.equal(`#${ROOT_ID}`);
    });

    it(`should redirect to ROOT_ID and resolve with saved root folder if item is not a folder and` +
        ` ID is ROOT_ID`, async () => {
      const id = 'id';
      const location = `${id}`;
      const item = Mocks.object('item');
      const rootItem = Mocks.object('rootItem');

      const mockGraph = jasmine.createSpyObj('Graph', ['get']);
      Fakes.build(mockGraph.get)
          .when(id).resolve(item)
          .when(ROOT_ID).resolve(rootItem);

      assert(await providesSelectedFolder(location, mockGraph)).to.equal(ROOT_ITEM);
    });

    it(`should resolve with ROOT_ITEM and navigate to ROOT_ID if location is not specified`,
        async () => {
      const mockGraph = jasmine.createSpyObj('Graph', ['get']);

      assert(await providesSelectedFolder('', mockGraph)).to.equal(ROOT_ITEM);
      assert(window.location.hash).to.equal(`#${ROOT_ID}`);
    });
  });
});
