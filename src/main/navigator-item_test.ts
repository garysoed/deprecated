import { assert, Mocks, TestBase, TestDispose } from '../test-base';
TestBase.setup();

import { Graph } from 'external/gs_tools/src/graph';
import { ImmutableSet } from 'external/gs_tools/src/immutable';
import { $location } from 'external/gs_tools/src/ui';

import {
  DriveFile,
  DriveFolder,
  DriveService,
  FileType,
  ItemService,
  ThothFolder } from '../data';
import { $item, NavigatorItem } from '../main/navigator-item';
import { RenderService } from '../render';

describe('main.NavigatorItem', () => {
  let item: NavigatorItem;

  beforeEach(() => {
    item = new NavigatorItem(Mocks.object('themeService'));
    TestDispose.add(item);
  });

  describe('onHostClick_', () => {
    it(`should navigate to the correct item`, async () => {
      const name = 'name';
      Graph.clearNodesForTests([$item, $location.path]);

      const path = 'path';
      Graph.createProvider($location.path, path);

      Graph.createProvider(
          $item,
          ThothFolder.newInstance('id', name, null, ImmutableSet.of([])));

      await item.onHostClick_();
      assert(window.location.hash).to.equal(`#/${path}/${name}`);

      window.location.hash = '';
    });

    it(`should do nothing if there are no items`, async () => {
      Graph.clearNodesForTests([$item]);

      Graph.createProvider($item, null);

      await item.onHostClick_();
      assert(window.location.hash).to.equal('');
    });
  });

  describe('onRefreshButtonAction_', () => {
    it(`should get and save the items again for files`, async () => {
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);

      const item1 = Mocks.object('item1');
      const item2 = Mocks.object('item2');
      spyOn(DriveService, 'recursiveGet').and.returnValue(Promise.resolve(ImmutableSet.of([
        item1,
        item2,
      ])));
      spyOn(ItemService, 'save');

      const parentId = 'parentId';
      const driveId = 'driveId';
      const driveItem = DriveFile
          .newInstance('id', 'name', parentId, FileType.ASSET, 'content', driveId);
      Graph.clearNodesForTests([$item]);
      Graph.createProvider($item, driveItem);

      const time = Graph.getTimestamp();

      await item.onRefreshButtonAction_(mockEvent);
      assert(ItemService.save).to.haveBeenCalledWith(time, item1);
      assert(ItemService.save).to.haveBeenCalledWith(time, item2);
      assert(DriveService.recursiveGet).to.haveBeenCalledWith(driveId, parentId, time);
      assert(mockEvent.stopPropagation).to.haveBeenCalledWith();
    });

    it(`should get and save the items again for folders`, async () => {
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);

      const item1 = Mocks.object('item1');
      const item2 = Mocks.object('item2');
      spyOn(DriveService, 'recursiveGet').and.returnValue(Promise.resolve(ImmutableSet.of([
        item1,
        item2,
      ])));
      spyOn(ItemService, 'save');

      const parentId = 'parentId';
      const driveId = 'driveId';
      const driveItem = DriveFolder
          .newInstance('id', 'name', parentId, ImmutableSet.of([]), driveId);
      Graph.clearNodesForTests([$item]);
      Graph.createProvider($item, driveItem);

      const time = Graph.getTimestamp();

      await item.onRefreshButtonAction_(mockEvent);
      assert(ItemService.save).to.haveBeenCalledWith(time, item1);
      assert(ItemService.save).to.haveBeenCalledWith(time, item2);
      assert(DriveService.recursiveGet).to.haveBeenCalledWith(driveId, parentId, time);
      assert(mockEvent.stopPropagation).to.haveBeenCalledWith();
    });

    it(`should not reject if the item has no parent IDs`, async () => {
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);

      const item1 = Mocks.object('item1');
      const item2 = Mocks.object('item2');
      spyOn(DriveService, 'recursiveGet').and.returnValue(Promise.resolve(ImmutableSet.of([
        item1,
        item2,
      ])));
      spyOn(ItemService, 'save');

      const driveId = 'driveId';
      const driveItem = DriveFolder
          .newInstance('id', 'name', null, ImmutableSet.of([]), driveId);
      Graph.clearNodesForTests([$item]);
      Graph.createProvider($item, driveItem);

      await assert(item.onRefreshButtonAction_(mockEvent)).to.rejectWithError(/should exist/);
      assert(mockEvent.stopPropagation).to.haveBeenCalledWith();
    });

    it(`should not reject if the item is not a DriveFile or DriveFolder`, async () => {
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);

      spyOn(ItemService, 'save');

      const parentId = 'parentId';
      const driveItem = ThothFolder.newInstance('id', 'name', parentId, ImmutableSet.of([]));
      Graph.clearNodesForTests([$item]);
      Graph.createProvider($item, driveItem);

      await item.onRefreshButtonAction_(mockEvent);
      assert(ItemService.save).toNot.haveBeenCalled();
      assert(mockEvent.stopPropagation).to.haveBeenCalledWith();
    });
  });

  describe('onRenderButtonAction_', () => {
    it(`should render the item correctly`, async () => {
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);
      const id = 'id';
      const driveItem = DriveFile
          .newInstance(id, 'name', 'parentId', FileType.ASSET, 'content', 'driveId');
      Graph.clearNodesForTests([$item]);
      Graph.createProvider($item, driveItem);

      const time = Graph.getTimestamp();
      spyOn(RenderService, 'render');

      await item.onRenderButtonAction_(mockEvent);
      assert(RenderService.render).to.haveBeenCalledWith(id, time);
    });

    it(`should not reject if the item is not a FileImpl`, async () => {
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);
      Graph.clearNodesForTests([$item]);
      Graph.createProvider($item, null);

      spyOn(RenderService, 'render');

      await item.onRenderButtonAction_(mockEvent);
      assert(RenderService.render).toNot.haveBeenCalled();
    });
  });

  describe('renderDeleteable_', () => {
    it(`should return true if the parent is ThothFolder`, async () => {
      const parentId = 'parentId';
      const driveItem = DriveFile
          .newInstance('id', 'name', parentId, FileType.ASSET, 'content', 'driveId');

      const parent = ThothFolder.newInstance('parentId', 'parentName', null, ImmutableSet.of([]));
      spyOn(ItemService, 'getItem').and.returnValue(Promise.resolve(parent));
      const time = Graph.getTimestamp();

      assert(await item.renderDeleteable_(driveItem, time)).to.beTrue();
      assert(ItemService.getItem).to.haveBeenCalledWith(parentId, time);
    });

    it(`should return false if the parent is not ThothFolder`, async () => {
      const parentId = 'parentId';
      const driveItem = DriveFile
          .newInstance('id', 'name', parentId, FileType.ASSET, 'content', 'driveId');

      const parent = DriveFolder
          .newInstance('parentId', 'parentName', null, ImmutableSet.of([]), 'driveId');
      spyOn(ItemService, 'getItem').and.returnValue(Promise.resolve(parent));
      const time = Graph.getTimestamp();

      assert(await item.renderDeleteable_(driveItem, time)).to.beFalse();
      assert(ItemService.getItem).to.haveBeenCalledWith(parentId, time);
    });

    it(`should return false if there are no parent IDs`, async () => {
      const driveItem = DriveFolder
          .newInstance('id', 'name', null, ImmutableSet.of([]), 'driveId');

      const time = Graph.getTimestamp();

      assert(await item.renderDeleteable_(driveItem, time)).to.beFalse();
    });

    it(`should return false if the item is null`, async () => {
      const time = Graph.getTimestamp();

      assert(await item.renderDeleteable_(null, time)).to.beFalse();
    });
  });

  describe('renderIcon_', () => {
    it(`should return "help" if the type is UNKNOWN`, () => {
      const selectedItem =
          DriveFile.newInstance('id', 'name', 'parentId', FileType.UNKNOWN, 'content', 'driveId');

      assert(item.renderIcon_(selectedItem)).to.equal('help');
    });

    it(`should return "folder" if the type is ASSET folder`, () => {
      const selectedItem =
          DriveFolder.newInstance('id', 'name', 'parentId', ImmutableSet.of([]), 'driveId');

      assert(item.renderIcon_(selectedItem)).to.equal('folder');
    });

    it(`should return "web" if the type is ASSET file`, () => {
      const selectedItem =
          DriveFile.newInstance('id', 'name', 'parentId', FileType.ASSET, 'content', 'driveId');

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

  describe('renderRefreshable_', () => {
    it(`should return true if item is a DriveFile`, () => {
      const inItem = DriveFile
          .newInstance('id', 'name', 'parentId', FileType.ASSET, 'content', 'driveId');

      assert(item.renderRefreshable_(inItem)).to.beTrue();
    });

    it(`should return true if item is a DriveFolder`, () => {
      const inItem = DriveFolder
          .newInstance('id', 'name', null, ImmutableSet.of([]), 'driveId');

      assert(item.renderRefreshable_(inItem)).to.beTrue();
    });

    it(`should return false if item is not a DriveFile or DriveFolder`, () => {
      const inItem = ThothFolder.newInstance('id', 'name', null, ImmutableSet.of([]));

      assert(item.renderRefreshable_(inItem)).to.beFalse();
    });
  });

  describe('renderViewable_', () => {
    it(`should return true if item is a File`, () => {
      const inItem = DriveFile
          .newInstance('id', 'name', 'parentId', FileType.ASSET, 'content', 'driveId');

      assert(item.renderViewable_(inItem)).to.beTrue();
    });

    it(`should return false if item is a Folder`, () => {
      const inItem = DriveFolder
          .newInstance('id', 'name', null, ImmutableSet.of([]), 'driveId');

      assert(item.renderViewable_(inItem)).to.beFalse();
    });
  });
});
