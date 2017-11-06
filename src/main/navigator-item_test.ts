import { assert, Mocks, TestBase, TestDispose } from '../test-base';
TestBase.setup();

import { FakeDataGraph } from 'external/gs_tools/src/datamodel';
import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { ItemImpl } from '../data/item-impl';
import { ThothFolder } from '../data/thoth-folder';
import { NavigatorItem } from '../main/navigator-item';



describe('main.NavigatorItem', () => {
  let item: NavigatorItem;

  beforeEach(() => {
    item = new NavigatorItem(Mocks.object('themeService'));
    TestDispose.add(item);
  });

  describe('renderName_', () => {
    it(`should resolve with the correct name`, async () => {
      const itemId = 'itemId';
      const itemName = 'itemName';
      const itemsGraph = new FakeDataGraph<ItemImpl>();
      await itemsGraph.set(
          itemId, ThothFolder.newInstance(itemId, itemName, null, ImmutableSet.of([])));

      await assert(item.renderName_(itemId, itemsGraph)).to.resolveWith(itemName);
    });

    it(`should resolve with '' if the item cannot be found`, async () => {
      const itemId = 'itemId';
      const itemsGraph = new FakeDataGraph<ItemImpl>();

      await assert(item.renderName_(itemId, itemsGraph)).to.resolveWith('');
    });
  });
});
