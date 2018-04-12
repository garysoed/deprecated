import { assert, Fakes, Mocks, TestBase, TestDispose, TestGraph } from '../test-base';
TestBase.setup();

import { ImmutableSet } from 'external/gs_tools/src/immutable';
import { $location } from 'external/gs_tools/src/ui';

import {
  $itemService,
  DataFile,
  EditableFolder,
  Folder,
  MarkdownFile,
  UnknownFile } from '../data';
import { DriveSource, ThothSource } from '../datasource';
import {
  $,
  $item,
  NavigatorItem,
  PREVIEW_PATH_ROOT,
  PREVIEW_WINDOW_NAME } from '../main/navigator-item';
import { $renderService } from '../render';

describe('main.NavigatorItem', () => {
  let item: NavigatorItem;
  let mockWindow: any;

  beforeEach(() => {
    mockWindow = jasmine.createSpyObj('Window', ['open']);
    item = new NavigatorItem(mockWindow, Mocks.object('themeService'));
    TestDispose.add(item);
  });

  describe('getDefaultItem_', () => {
    it(`should return the item in the folder with name 'index'`, async () => {
      const item1Id = 'item1Id';
      const item2Id = 'item2Id';
      const indexItemId = 'indexItemId';
      const mockItem1 = jasmine.createSpyObj('Item1', ['getName']);
      mockItem1.getName.and.returnValue('item1.ext');
      const mockItem2 = jasmine.createSpyObj('Item2', ['getName']);
      mockItem2.getName.and.returnValue('item2.ext');
      const mockIndexItem = jasmine.createSpyObj('IndexItem', ['getName']);
      mockIndexItem.getName.and.returnValue('index.js.test');

      const mockItem = jasmine.createSpyObj('Item', ['getItems']);
      mockItem.getItems.and.returnValue(ImmutableSet.of([item1Id, item2Id, indexItemId]));
      Object.setPrototypeOf(mockItem, Folder.prototype);

      const mockItemService = jasmine.createSpyObj('ItemService', ['getItem']);
      Fakes.build(mockItemService.getItem)
          .when(item1Id).resolve(mockItem1)
          .when(item2Id).resolve(mockItem2)
          .when(indexItemId).resolve(mockIndexItem);

      assert(await item['getDefaultItem_'](mockItem, mockItemService)).to.equal(mockIndexItem);
    });

    it(`should return the first item in the folder if none are called 'index'`, async () => {
      const item1Id = 'item1Id';
      const item2Id = 'item2Id';
      const mockItem1 = jasmine.createSpyObj('Item1', ['getName']);
      mockItem1.getName.and.returnValue('item1.ext');
      const mockItem2 = jasmine.createSpyObj('Item2', ['getName']);
      mockItem2.getName.and.returnValue('item2.ext');

      const mockItem = jasmine.createSpyObj('Item', ['getItems']);
      mockItem.getItems.and.returnValue(ImmutableSet.of([item1Id, item2Id]));
      Object.setPrototypeOf(mockItem, Folder.prototype);

      const mockItemService = jasmine.createSpyObj('ItemService', ['getItem']);
      Fakes.build(mockItemService.getItem)
          .when(item1Id).resolve(mockItem1)
          .when(item2Id).resolve(mockItem2);

      assert(await item['getDefaultItem_'](mockItem, mockItemService)).to.equal(mockItem1);
    });

    it(`should return null if the folder is empty`, async () => {
      const mockItem = jasmine.createSpyObj('Item', ['getItems']);
      mockItem.getItems.and.returnValue(ImmutableSet.of([]));
      Object.setPrototypeOf(mockItem, Folder.prototype);

      const itemService = Mocks.object('itemService');

      assert(await item['getDefaultItem_'](mockItem, itemService)).to.beNull();
    });

    it(`should return the item if it isn't a folder`, async () => {
      const driveItem = Mocks.object('driveItem');
      const itemService = Mocks.object('itemService');

      assert(await item['getDefaultItem_'](driveItem, itemService)).to.equal(driveItem);
    });
  });

  describe('onDeleteButtonAction_', () => {
    it(`should delete the item correctly`, async () => {
      const itemId = 'itemId';
      TestGraph.set($.host.itemid.getId(), itemId);

      const mockItemService = jasmine.createSpyObj('ItemService', ['deleteItem']);
      TestGraph.set($itemService, mockItemService);

      await item.onDeleteButtonAction_();
      assert(mockItemService.deleteItem).to.haveBeenCalledWith(itemId);
    });
  });

  describe('onHostClick_', () => {
    it(`should navigate to the correct item`, async () => {
      const name = 'name';

      const path = 'path';
      TestGraph.set($location.path, path);
      TestGraph.set(
          $item,
          Folder.newInstance(
              'id',
              name,
              null,
              ImmutableSet.of([]),
              ThothSource.newInstance()));

      await item.onHostClick_();
      assert(window.location.hash).to.equal(`#/${path}/${name}`);

      window.location.hash = '';
    });

    it(`should do nothing if there are no items`, async () => {
      TestGraph.set($item, null);

      await item.onHostClick_();
      assert(window.location.hash).to.equal('');
    });
  });

  // describe('onRefreshButtonAction_', () => {
  //   it(`should get and save the items again for files`, async () => {
  //     const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);

  //     const item1 = Mocks.object('item1');
  //     const item2 = Mocks.object('item2');
  //     const mockDriveService = jasmine.createSpyObj('DriveService', ['recursiveGet']);
  //     mockDriveService.recursiveGet.and.returnValue(Promise.resolve(ImmutableSet.of([
  //       item1,
  //       item2,
  //     ])));
  //     TestGraph.set($driveService, mockDriveService);

  //     const mockItemService = jasmine.createSpyObj('ItemService', ['save']);
  //     TestGraph.set($itemService, mockItemService);

  //     const parentId = 'parentId';
  //     const driveId = 'driveId';
  //     const driveItem = MarkdownFile.newInstance(
  //         'id', 'name', parentId, 'content', DriveSource.newInstance(driveId));
  //     TestGraph.set($item, driveItem);

  //     await item.onRefreshButtonAction_(mockEvent);
  //     assert(mockItemService.save).to.haveBeenCalledWith(item1);
  //     assert(mockItemService.save).to.haveBeenCalledWith(item2);
  //     assert(mockDriveService.recursiveGet).to
  //         .haveBeenCalledWith(DriveSourceMatcher.with(driveId), parentId);
  //     assert(mockEvent.stopPropagation).to.haveBeenCalledWith();
  //   });

  //   it(`should get and save the items again for folders`, async () => {
  //     const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);

  //     const item1 = Mocks.object('item1');
  //     const item2 = Mocks.object('item2');
  //     const mockDriveService = jasmine.createSpyObj('DriveService', ['recursiveGet']);
  //     mockDriveService.recursiveGet.and.returnValue(Promise.resolve(ImmutableSet.of([
  //       item1,
  //       item2,
  //     ])));
  //     TestGraph.set($driveService, mockDriveService);

  //     const mockItemService = jasmine.createSpyObj('ItemService', ['save']);
  //     TestGraph.set($itemService, mockItemService);

  //     const parentId = 'parentId';
  //     const driveId = 'driveId';
  //     const driveItem = DriveFolder.newInstance(
  //         'id', 'name', parentId, ImmutableSet.of([]), DriveSource.newInstance(driveId));
  //     TestGraph.set($item, driveItem);

  //     await item.onRefreshButtonAction_(mockEvent);
  //     assert(mockItemService.save).to.haveBeenCalledWith(item1);
  //     assert(mockItemService.save).to.haveBeenCalledWith(item2);
  //     assert(mockDriveService.recursiveGet).to
  //         .haveBeenCalledWith(DriveSourceMatcher.with(driveId), parentId);
  //     assert(mockEvent.stopPropagation).to.haveBeenCalledWith();
  //   });

  //   it(`should not reject if the item has no parent IDs`, async () => {
  //     const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);

  //     const item1 = Mocks.object('item1');
  //     const item2 = Mocks.object('item2');
  //     const mockDriveService = jasmine.createSpyObj('DriveService', ['recursiveGet']);
  //     mockDriveService.recursiveGet.and.returnValue(Promise.resolve(ImmutableSet.of([
  //       item1,
  //       item2,
  //     ])));

  //     const mockItemService = jasmine.createSpyObj('ItemService', ['save']);
  //     TestGraph.set($itemService, mockItemService);

  //     const driveId = 'driveId';
  //     const driveItem = DriveFolder
  //       .newInstance('id', 'name', null, ImmutableSet.of([]), DriveSource.newInstance(driveId));
  //     TestGraph.set($item, driveItem);

  //     await assert(item.onRefreshButtonAction_(mockEvent)).to.rejectWithError(/should exist/);
  //     assert(mockEvent.stopPropagation).to.haveBeenCalledWith();
  //   });

  //   it(`should not reject if the item is not a DriveFile or DriveFolder`, async () => {
  //     const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);


  //     const mockItemService = jasmine.createSpyObj('ItemService', ['save']);
  //     TestGraph.set($itemService, mockItemService);

  //     const parentId = 'parentId';
  //     const driveItem = ThothFolder.newInstance('id', 'name', parentId, ImmutableSet.of([]));
  //     TestGraph.set($item, driveItem);

  //     await item.onRefreshButtonAction_(mockEvent);
  //     assert(mockItemService.save).toNot.haveBeenCalled();
  //     assert(mockEvent.stopPropagation).to.haveBeenCalledWith();
  //   });
  // });

  describe('onRenderButtonAction_', () => {
    it(`should render the item correctly`, async () => {
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);
      const id = 'id';
      const driveItem = MarkdownFile.newInstance(
          id, 'name', 'parentId', 'content', DriveSource.newInstance('driveId'));
      TestGraph.set($item, driveItem);

      const mockRenderService = jasmine.createSpyObj('RenderService', ['render']);
      TestGraph.set($renderService, mockRenderService);

      const path = 'path';
      const mockItemService = jasmine.createSpyObj('ItemService', ['getPath']);
      mockItemService.getPath.and.returnValue(path);
      TestGraph.set($itemService, mockItemService);

      spyOn(item, 'getDefaultItem_').and.returnValue(Promise.resolve(driveItem));

      await item.onRenderButtonAction_(mockEvent);
      assert(mockRenderService.render).to.haveBeenCalledWith(id);
      assert(mockWindow.open).to.haveBeenCalledWith(
          `${PREVIEW_PATH_ROOT}${path}`,
          PREVIEW_WINDOW_NAME);
      assert(mockItemService.getPath).to.haveBeenCalledWith(id);
      assert(item['getDefaultItem_']).to.haveBeenCalledWith(driveItem, mockItemService);
    });

    it(`should not navigate if path cannot be found`, async () => {
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);
      const id = 'id';
      const driveItem = MarkdownFile.newInstance(
          id, 'name', 'parentId', 'content', DriveSource.newInstance('driveId'));
      TestGraph.set($item, driveItem);

      const mockRenderService = jasmine.createSpyObj('RenderService', ['render']);
      TestGraph.set($renderService, mockRenderService);

      const mockItemService = jasmine.createSpyObj('ItemService', ['getPath']);
      mockItemService.getPath.and.returnValue(null);
      TestGraph.set($itemService, mockItemService);

      spyOn(item, 'getDefaultItem_').and.returnValue(Promise.resolve(driveItem));

      await item.onRenderButtonAction_(mockEvent);
      assert(mockRenderService.render).to.haveBeenCalledWith(id);
      assert(mockWindow.open).toNot.haveBeenCalled();
      assert(mockItemService.getPath).to.haveBeenCalledWith(id);
      assert(item['getDefaultItem_']).to.haveBeenCalledWith(driveItem, mockItemService);
    });

    it(`should not navigate if default item cannot be found`, async () => {
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);
      const id = 'id';
      const driveItem = MarkdownFile.newInstance(
          id, 'name', 'parentId', 'content', DriveSource.newInstance('driveId'));
      TestGraph.set($item, driveItem);

      const mockRenderService = jasmine.createSpyObj('RenderService', ['render']);
      TestGraph.set($renderService, mockRenderService);

      const mockItemService = jasmine.createSpyObj('ItemService', ['getPath']);
      mockItemService.getPath.and.returnValue(null);
      TestGraph.set($itemService, mockItemService);

      spyOn(item, 'getDefaultItem_').and.returnValue(Promise.resolve(null));

      await item.onRenderButtonAction_(mockEvent);
      assert(mockRenderService.render).to.haveBeenCalledWith(id);
      assert(mockWindow.open).toNot.haveBeenCalled();
      assert(item['getDefaultItem_']).to.haveBeenCalledWith(driveItem, mockItemService);
    });

    it(`should not reject if the item is not a FileImpl`, async () => {
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);
      TestGraph.set($item, null);

      const mockRenderService = jasmine.createSpyObj('RenderService', ['render']);
      TestGraph.set($renderService, mockRenderService);

      await item.onRenderButtonAction_(mockEvent);
      assert(mockRenderService.render).toNot.haveBeenCalled();
    });
  });

  describe('providesItem', () => {
    it(`should resolve with the correct item`, async () => {
      const id = 'id';
      const selectedItem = MarkdownFile.newInstance(
          id, 'name', 'parentId', 'content', DriveSource.newInstance('driveId'));

      const mockItemService = jasmine.createSpyObj('ItemService', ['getItem']);
      mockItemService.getItem.and.returnValue(Promise.resolve(selectedItem));

      assert(await item.providesItem(mockItemService, id)).to.equal(selectedItem);
    });

    it(`should resolve with null if there are no item IDs`, async () => {
      const mockItemService = jasmine.createSpyObj('ItemService', ['getItem']);

      assert(await item.providesItem(mockItemService, null)).to.equal(null);
    });
  });

  describe('providesParent', () => {
    it(`should return the correct parent`, async () => {
      const parentId = 'parentId';
      const driveItem = MarkdownFile.newInstance(
          'id', 'name', parentId, 'content', DriveSource.newInstance('driveId'));

      const parent = Folder.newInstance(
          'parentId',
          'parentName',
          null,
          ImmutableSet.of([]),
          ThothSource.newInstance());
      const mockItemService = jasmine.createSpyObj('ItemService', ['getItem']);
      mockItemService.getItem.and.returnValue(Promise.resolve(parent));

      assert(await item.providesParent(driveItem, mockItemService)).to.equal(parent);
      assert(mockItemService.getItem).to.haveBeenCalledWith(parentId);
    });

    it(`should return null if there are no parent IDs`, async () => {
      const driveItem = Folder
          .newInstance('id', 'name', null, ImmutableSet.of([]), DriveSource.newInstance('driveId'));

      const mockItemService = jasmine.createSpyObj('ItemService', ['getItem']);

      assert(await item.providesParent(driveItem, mockItemService)).to.beNull();
    });

    it(`should return null if there are no items`, async () => {
      const mockItemService = jasmine.createSpyObj('ItemService', ['getItem']);

      assert(await item.providesParent(null, mockItemService)).to.beNull();
    });
  });

  describe('renderDeleteable_', () => {
    it(`should return true if the parent is EditableFolder`, () => {
      const parent = EditableFolder.newInstance(
        'id',
        'name',
        null,
        ImmutableSet.of([]),
        ThothSource.newInstance());

      assert(item.renderDeleteable_(parent)).to.beTrue();
    });

    it(`should return false if the parent is not EditableFolder`, () => {
      const parent = Folder.newInstance(
          'parentId', 'parentName', null, ImmutableSet.of([]), DriveSource.newInstance('driveId'));

      assert(item.renderDeleteable_(parent)).to.beFalse();
    });

    it(`should return false if the parent is null`, () => {
      assert(item.renderDeleteable_(null)).to.beFalse();
    });
  });

  describe('renderIcon_', () => {
    it(`should return "help" if the type is UNKNOWN`, () => {
      const selectedItem = UnknownFile.newInstance(
          'id',
          'name',
          'parentId',
          DriveSource.newInstance('driveId'));

      assert(item.renderIcon_(selectedItem)).to.equal('help');
    });

    it(`should return "folder" if the type is folder`, () => {
      const selectedItem = Folder.newInstance(
          'id', 'name', 'parentId', ImmutableSet.of([]), DriveSource.newInstance('driveId'));

      assert(item.renderIcon_(selectedItem)).to.equal('folder');
    });

    it(`should return "web" if the type is ASSET file`, () => {
      const selectedItem = MarkdownFile.newInstance(
          'id', 'name', 'parentId', 'content', DriveSource.newInstance('driveId'));

      assert(item.renderIcon_(selectedItem)).to.equal('web');
    });

    it(`should return '' if there are no items`, () => {
      assert(item.renderIcon_(null)).to.equal('');
    });
  });

  describe('renderName_', () => {
    it(`should resolve with the correct name`, () => {
      const itemName = 'itemName';
      const selectedItem = Folder.newInstance(
          'id',
          itemName,
          null,
          ImmutableSet.of([]),
          ThothSource.newInstance());

      assert(item.renderName_(selectedItem)).to.equal(itemName);
    });

    it(`should resolve with '' if the item cannot be found`, () => {
      assert(item.renderName_(null)).to.equal('');
    });
  });

  describe('renderRefreshable_', () => {
    it(`should return true if deleteable and source is remote`, () => {
      const file = MarkdownFile.newInstance(
          'id',
          'name',
          'parentId',
          'content',
          DriveSource.newInstance('driveId'));
      spyOn(item, 'renderDeleteable_').and.returnValue(true);

      assert(item.renderRefreshable_(file)).to.beTrue();
      assert(item.renderDeleteable_).to.haveBeenCalledWith(file);
    });

    it(`should return false if source is not remote`, () => {
      const file = MarkdownFile.newInstance(
          'id',
          'name',
          'parentId',
          'content',
          ThothSource.newInstance());
      spyOn(item, 'renderDeleteable_').and.returnValue(true);

      assert(item.renderRefreshable_(file)).to.beFalse();
      assert(item.renderDeleteable_).to.haveBeenCalledWith(file);
    });

    it(`should return false if not deleteable`, () => {
      const file = MarkdownFile.newInstance(
          'id',
          'name',
          'parentId',
          'content',
          DriveSource.newInstance('driveId'));
      spyOn(item, 'renderDeleteable_').and.returnValue(false);

      assert(item.renderRefreshable_(file)).to.beFalse();
      assert(item.renderDeleteable_).to.haveBeenCalledWith(file);
    });

    it(`should return false if there are no items`, () => {
      assert(item.renderRefreshable_(null)).to.beFalse();
    });
  });

  describe('renderRenderable_', () => {
    it(`should return true if item is DataFile`, () => {
      const file = DataFile.newInstance(
          'id',
          'name',
          'parentId',
          {},
          ThothSource.newInstance());

      assert(item.renderRenderable_(file)).to.beTrue();
    });

    it(`should return true if item is MarkdownFile`, () => {
      const file = MarkdownFile.newInstance(
          'id',
          'name',
          'parentId',
          'content',
          ThothSource.newInstance());

      assert(item.renderRenderable_(file)).to.beTrue();
    });

    it(`should return false if item is Folder`, () => {
      const file = Folder.newInstance(
          'id',
          'name',
          'parentId',
          ImmutableSet.of([]),
          ThothSource.newInstance());

      assert(item.renderRenderable_(file)).to.beFalse();
    });

    it(`should return false if there are no items`, () => {
      assert(item.renderRenderable_(null)).to.beFalse();
    });
  });
});
