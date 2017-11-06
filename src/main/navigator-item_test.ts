import { assert, Mocks, TestBase, TestDispose } from '../test-base';
TestBase.setup();

import { Graph } from 'external/gs_tools/src/graph';
import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { DriveFile } from '../data/drive-file';
import { ItemType } from '../data/item-type';
import { ThothFolder } from '../data/thoth-folder';
import { $item, NavigatorItem } from '../main/navigator-item';

describe('main.NavigatorItem', () => {
  let item: NavigatorItem;

  beforeEach(() => {
    item = new NavigatorItem(Mocks.object('themeService'));
    TestDispose.add(item);
  });

  describe('onHostClick_', () => {
    it(`should navigate to the correct item`, async () => {
      const id = 'id';
      Graph.clearNodesForTests([$item]);

      Graph.createProvider(
          $item,
          ThothFolder.newInstance(id, 'name', null, ImmutableSet.of([])));

      await item.onHostClick_();
      assert(window.location.hash).to.equal(`#/${id}`);

      window.location.hash = '';
    });

    it(`should do nothing if there are no items`, async () => {
      Graph.clearNodesForTests([$item]);

      Graph.createProvider($item, null);

      await item.onHostClick_();
      assert(window.location.hash).to.equal('');
    });
  });

  describe('renderIcon_', () => {
    it(`should return "help" if the type is UNKNOWN`, () => {
      const selectedItem =
          DriveFile.newInstance('id', 'name', 'parentId', ItemType.UNKNOWN, 'content');

      assert(item.renderIcon_(selectedItem)).to.equal('help');
    });

    it(`should return "web" if the type is FILE`, () => {
      const selectedItem =
          DriveFile.newInstance('id', 'name', 'parentId', ItemType.FILE, 'content');

      assert(item.renderIcon_(selectedItem)).to.equal('web');
    });

    it(`should return '' if there are no items`, () => {
      assert(item.renderIcon_(null)).to.equal('');
    });
  });

  describe('renderName_', () => {
    it(`should resolve with the correct name`, () => {
      const itemName = 'itemName';
      const selectedItem = ThothFolder.newInstance('id', itemName, null, ImmutableSet.of([]));

      assert(item.renderName_(selectedItem)).to.equal(itemName);
    });

    it(`should resolve with '' if the item cannot be found`, () => {
      assert(item.renderName_(null)).to.equal('');
    });
  });
});
