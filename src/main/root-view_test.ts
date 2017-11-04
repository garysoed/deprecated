import { assert, Fakes, Mocks, TestBase, TestDispose } from '../test-base';
TestBase.setup();

import { RootView } from '../main/root-view';


describe('main.RootView', () => {
  let view: RootView;

  beforeEach(() => {
    view = new RootView(Mocks.object('ThemeService'));
    TestDispose.add(view);
  });

  describe('renderCrumbs_', () => {
    it(`should return the correct crumbs`, async () => {
      const idA = 'aId';
      const idRoot = 'rootId';
      const mockFolderRoot = jasmine.createSpyObj('FolderRoot', ['getParentId', 'getName']);
      mockFolderRoot.getParentId.and.returnValue(null);
      mockFolderRoot.getName.and.returnValue('(root)');

      const mockFolderA = jasmine.createSpyObj('FolderA', ['getParentId', 'getName']);
      mockFolderA.getParentId.and.returnValue(idRoot);
      mockFolderA.getName.and.returnValue('a');

      const mockFolderB = jasmine.createSpyObj('FolderB', ['getParentId', 'getName']);
      mockFolderB.getParentId.and.returnValue(idA);
      mockFolderB.getName.and.returnValue('b');

      const mockItemsGraph = jasmine.createSpyObj('ItemsGraph', ['get']);
      Fakes.build(mockItemsGraph.get)
          .when(idA).resolve(mockFolderA)
          .when(idRoot).resolve(mockFolderRoot);

      assert(await view.renderCrumbs_(mockFolderB, mockItemsGraph)).to.haveElements([
        {name: '(root)', url: '/(root)'},
        {name: 'a', url: '/(root)/a'},
        {name: 'b', url: '/(root)/a/b'},
      ]);
      assert(mockItemsGraph.get).to.haveBeenCalledWith(idA);
      assert(mockItemsGraph.get).to.haveBeenCalledWith(idRoot);
    });
  });
});
