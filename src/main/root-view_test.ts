import { assert, Fakes, Mocks, TestBase, TestDispose } from '../test-base';
TestBase.setup();

import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { PreviewFile, ThothFolder } from '../data';
import { ContentType, RootView } from '../main/root-view';


describe('main.RootView', () => {
  let view: RootView;

  beforeEach(() => {
    view = new RootView(Mocks.object('ThemeService'));
    TestDispose.add(view);
  });

  describe('renderContentSwitch_', () => {
    it(`should return the correct content type if the selected item type is not RENDER`, () => {
      const contentType = ContentType.ADD;
      const selectedItem = ThothFolder.newInstance('id', 'name', null, ImmutableSet.of([]));

      assert(view.renderContentSwitch_(contentType, selectedItem)).to.equal(contentType);
    });

    it(`should return PREVIEW if the selected item type is RENDER`, () => {
      const contentType = ContentType.ADD;
      const selectedItem = PreviewFile
          .newInstance('id', 'name', 'parentId', 'content', 'originalId');

      assert(view.renderContentSwitch_(contentType, selectedItem)).to.equal(ContentType.PREVIEW);
    });

    it(`should return the content type if the selected item does not exist`, () => {
      const contentType = ContentType.ADD;

      assert(view.renderContentSwitch_(contentType, null)).to.equal(contentType);
    });
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
