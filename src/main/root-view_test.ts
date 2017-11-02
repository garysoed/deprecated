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
      const aId = 'aId';
      const rootId = 'rootId';
      const root = {name: '(root)', parentId: null, path: '/'};
      const a = {name: 'a', parentId: rootId, path: '/a'};
      const b = {name: 'b', parentId: aId, path: '/a/b'};
      const mockItemsGraph = jasmine.createSpyObj('ItemsGraph', ['get']);
      Fakes.build(mockItemsGraph.get)
          .when(aId).resolve(a)
          .when(rootId).resolve(root);

      assert(await view.renderCrumbs_(b as any, mockItemsGraph)).to.haveElements([
        {name: '(root)', url: '/'},
        {name: 'a', url: '/a'},
        {name: 'b', url: '/a/b'},
      ]);
      assert(mockItemsGraph.get).to.haveBeenCalledWith(aId);
      assert(mockItemsGraph.get).to.haveBeenCalledWith(rootId);
    });
  });
});
