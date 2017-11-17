import { assert, Mocks, TestBase, TestDispose } from '../test-base';
TestBase.setup();

import { Graph } from 'external/gs_tools/src/graph';

import { $selected, SearchItem, selectedProvider } from '../main/search-item';


describe('main.SearchItem', () => {
  let item: SearchItem;

  beforeEach(() => {
    item = new SearchItem(Mocks.object('ThemeService'));
    TestDispose.add(item);
  });

  describe('onElementClick_', async () => {
    it(`should toggle the selected value`, async () => {
      await selectedProvider(false, item);
      await item.onElementClick_();
      await assert(Graph.get($selected, Graph.getTimestamp(), item)).to.resolveWith(true);
    });
  });
});
