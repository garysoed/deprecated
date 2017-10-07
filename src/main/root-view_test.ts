import { assert, Mocks, TestBase, TestDispose } from '../test-base';
TestBase.setup();

import { RootView } from '../main/root-view';


describe('main.RootView', () => {
  let view: RootView;

  beforeEach(() => {
    view = new RootView(Mocks.object('ThemeService'));
    TestDispose.add(view);
  });

  describe('renderCrumbs_', () => {
    it(`should return the correct crumbs`, () => {
      const root = {name: '(root)', parent: null, path: '/'};
      const a = {name: 'a', parent: root, path: '/a'};
      const b = {name: 'b', parent: a, path: '/a/b'};
      assert(view.renderCrumbs_(b as any)).to.haveElements([
        {name: '(root)', url: '/'},
        {name: 'a', url: '/a'},
        {name: 'b', url: '/a/b'},
      ]);
    });
  });
});
