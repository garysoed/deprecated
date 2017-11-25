import { assert, Matchers, Mocks, TestBase, TestDispose } from '../test-base';
TestBase.setup();

import { Graph } from 'external/gs_tools/src/graph';
import { ImmutableSet } from 'external/gs_tools/src/immutable';
import { $location } from 'external/gs_tools/src/ui';

import { FakeDataGraph } from 'external/gs_tools/src/datamodel';
import { Persona } from 'external/gs_tools/src/persona';
import {
  DriveFile,
  DriveFolder,
  DriveService,
  FileType,
  Item,
  ItemService,
  ThothFolder} from '../data';
import { $, $isEditing, $item, $parent, NavigatorItem } from '../main/navigator-item';
import { RenderService } from '../render';

describe('main.NavigatorItem', () => {
  let item: NavigatorItem;

  beforeEach(() => {
    item = new NavigatorItem(Mocks.object('themeService'));
    TestDispose.add(item);
  });

  describe('onDeleteButtonAction_', () => {
    it(`should delete the item correctly`, async () => {
      const idOld = 'idOld';
      const idDelete = 'idDelete';

      Graph.clearNodesForTests([$parent, $.host.itemid.getId()]);
      const parent = ThothFolder
          .newInstance('idParent', 'name', null, ImmutableSet.of([idOld, idDelete]));
      Graph.createProvider($parent, parent);
      Graph.createProvider($.host.itemid.getId(), idDelete);

      const saveSpy = spyOn(ItemService, 'save');

      await item.onDeleteButtonAction_();
      assert(ItemService.save).to.haveBeenCalledWith(Graph.getTimestamp(), Matchers.anyThing());

      const newParent: ThothFolder = saveSpy.calls.argsFor(0)[1];
      assert(newParent.getItems()).to.haveElements([idOld]);
    });

    it(`should not save if the parent is not a ThothFolder`, async () => {
      const idDelete = 'idDelete';

      Graph.clearNodesForTests([$parent, $.host.itemid.getId()]);
      const parent = DriveFolder
          .newInstance('idParent', 'name', null, ImmutableSet.of([]), 'driveId');
      Graph.createProvider($parent, parent);
      Graph.createProvider($.host.itemid.getId(), idDelete);

      spyOn(ItemService, 'save');

      await item.onDeleteButtonAction_();
      assert(ItemService.save).toNot.haveBeenCalled();
    });

    it(`should not save if the parent is null`, async () => {
      const idDelete = 'idDelete';

      Graph.clearNodesForTests([$parent, $.host.itemid.getId()]);
      Graph.createProvider($parent, null);
      Graph.createProvider($.host.itemid.getId(), idDelete);

      spyOn(ItemService, 'save');

      await item.onDeleteButtonAction_();
      assert(ItemService.save).toNot.haveBeenCalled();
    });

    it(`should not save if itemId does not exist`, async () => {
      Graph.clearNodesForTests([$parent, $.host.itemid.getId()]);

      const parent = ThothFolder
          .newInstance('idParent', 'name', null, ImmutableSet.of([]));
      Graph.createProvider($parent, parent);
      Graph.createProvider($.host.itemid.getId(), '');

      spyOn(ItemService, 'save');

      await item.onDeleteButtonAction_();
      assert(ItemService.save).toNot.haveBeenCalled();
    });
  });

  describe('onHostClick_', () => {
    it(`should navigate to the correct item`, async () => {
      const name = 'name';
      Graph.clearNodesForTests([$item, $location.path, $isEditing]);

      const path = 'path';
      Graph.createProvider($location.path, path);
      Graph.createProvider($isEditing, false);
      Graph.createProvider(
          $item,
          ThothFolder.newInstance('id', name, null, ImmutableSet.of([])));

      await item.onHostClick_();
      assert(window.location.hash).to.equal(`#/${path}/${name}`);

      window.location.hash = '';
    });

    it(`should do nothing if there are no items`, async () => {
      Graph.clearNodesForTests([$item, $isEditing]);

      Graph.createProvider($item, null);
      Graph.createProvider($isEditing, false);

      await item.onHostClick_();
      assert(window.location.hash).to.equal('');
    });

    it(`should do nothing if editing`, async () => {
      Graph.clearNodesForTests([$item, $isEditing]);

      Graph.createProvider($item, null);
      Graph.createProvider($isEditing, true);

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

  describe('onRenameButtonAction_', () => {
    it(`should set the input to the name and set the edit flag if not editing`, async () => {
      const itemName = 'itemName';
      const shadowRoot = Mocks.object('shadowRoot');
      spyOn(Persona, 'getShadowRoot').and.returnValue(shadowRoot);

      Graph.clearNodesForTests([$isEditing, $item]);

      const selectedItem = ThothFolder.newInstance('id', itemName, null, ImmutableSet.of([]));
      Graph.createProvider($isEditing, false);
      Graph.createProvider($item, selectedItem);

      spyOn($.nameInput.value, 'setValue');

      const time = Graph.getTimestamp();

      await item.onRenameButtonAction_();
      assert(await Graph.get($isEditing, Graph.getTimestamp(), item)).to.beTrue();
      assert($.nameInput.value.setValue).to.haveBeenCalledWith(itemName, shadowRoot, time);
      assert(Persona.getShadowRoot).to.haveBeenCalledWith(item);
    });

    it(`should save the input name change and unset the edit flag if editing`, async () => {
      const shadowRoot = Mocks.object('shadowRoot');
      spyOn(Persona, 'getShadowRoot').and.returnValue(shadowRoot);

      Graph.clearNodesForTests([$isEditing, $item]);

      const selectedItem = ThothFolder.newInstance('id', 'itemName', null, ImmutableSet.of([]));
      Graph.createProvider($isEditing, true);
      Graph.createProvider($item, selectedItem);

      const saveSpy = spyOn(ItemService, 'save');

      const newName = 'newName';
      spyOn($.nameInput.value, 'getValue').and.returnValue(newName);

      const time = Graph.getTimestamp();

      await item.onRenameButtonAction_();
      assert(await Graph.get($isEditing, Graph.getTimestamp(), item)).to.beFalse();

      assert(ItemService.save).to.haveBeenCalledWith(time, Matchers.anyThing());
      const newItem: Item = saveSpy.calls.argsFor(0)[1];
      assert(newItem.getName()).to.equal(newName);
      assert($.nameInput.value.getValue).to.haveBeenCalledWith(shadowRoot);
      assert(Persona.getShadowRoot).to.haveBeenCalledWith(item);
    });

    it(`should not save the new name if the new name is empty`, async () => {
      const shadowRoot = Mocks.object('shadowRoot');
      spyOn(Persona, 'getShadowRoot').and.returnValue(shadowRoot);

      Graph.clearNodesForTests([$isEditing, $item]);

      const selectedItem = ThothFolder.newInstance('id', 'itemName', null, ImmutableSet.of([]));
      Graph.createProvider($isEditing, true);
      Graph.createProvider($item, selectedItem);

      spyOn(ItemService, 'save');

      spyOn($.nameInput.value, 'getValue').and.returnValue('');

      await item.onRenameButtonAction_();
      assert(await Graph.get($isEditing, Graph.getTimestamp(), item)).to.beFalse();

      assert(ItemService.save).toNot.haveBeenCalled();
      assert($.nameInput.value.getValue).to.haveBeenCalledWith(shadowRoot);
      assert(Persona.getShadowRoot).to.haveBeenCalledWith(item);
    });

    it(`should do nothing if there are no items`, async () => {
      const shadowRoot = Mocks.object('shadowRoot');
      spyOn(Persona, 'getShadowRoot').and.returnValue(shadowRoot);

      Graph.clearNodesForTests([$isEditing, $item]);

      Graph.createProvider($isEditing, true);
      Graph.createProvider($item, null);

      spyOn(ItemService, 'save');

      spyOn($.nameInput.value, 'getValue').and.returnValue('');

      await item.onRenameButtonAction_();
      assert(await Graph.get($isEditing, Graph.getTimestamp(), item)).to.beTrue();

      assert(ItemService.save).toNot.haveBeenCalled();
      assert(Persona.getShadowRoot).to.haveBeenCalledWith(item);
    });

    it(`should do nothing if shadow roots cannot be found`, async () => {
      spyOn(Persona, 'getShadowRoot').and.returnValue(null);

      Graph.clearNodesForTests([$isEditing, $item]);

      Graph.createProvider($isEditing, true);
      Graph.createProvider($item, null);

      spyOn(ItemService, 'save');

      spyOn($.nameInput.value, 'getValue').and.returnValue('');

      await item.onRenameButtonAction_();
      assert(await Graph.get($isEditing, Graph.getTimestamp(), item)).to.beTrue();

      assert(ItemService.save).toNot.haveBeenCalled();
      assert(Persona.getShadowRoot).to.haveBeenCalledWith(item);
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

  describe('providesItem', () => {
    it(`should resolve with the correct item`, async () => {
      const id = 'id';
      const selectedItem = DriveFile
          .newInstance(id, 'name', 'parentId', FileType.ASSET, 'content', 'driveId');
      const itemsGraph = new FakeDataGraph<Item>();
      itemsGraph.set(id, selectedItem);

      spyOn(ItemService, 'getItem').and.returnValue(Promise.resolve(selectedItem));

      assert(await item.providesItem(itemsGraph, id)).to.equal(selectedItem);
    });

    it(`should resolve with null if there are no item IDs`, async () => {
      assert(await item.providesItem(new FakeDataGraph<Item>(), null)).to.equal(null);
    });
  });

  describe('providesParent', () => {
    it(`should return the correct parent`, async () => {
      const parentId = 'parentId';
      const driveItem = DriveFile
          .newInstance('id', 'name', parentId, FileType.ASSET, 'content', 'driveId');

      const parent = ThothFolder.newInstance('parentId', 'parentName', null, ImmutableSet.of([]));
      spyOn(ItemService, 'getItem').and.returnValue(Promise.resolve(parent));
      const time = Graph.getTimestamp();

      assert(await item.providesParent(driveItem, time)).to.equal(parent);
      assert(ItemService.getItem).to.haveBeenCalledWith(parentId, time);
    });

    it(`should return null if there are no parent IDs`, async () => {
      const driveItem = DriveFolder
          .newInstance('id', 'name', null, ImmutableSet.of([]), 'driveId');

      const time = Graph.getTimestamp();

      assert(await item.providesParent(driveItem, time)).to.beNull();
    });

    it(`should return null if there are no items`, async () => {
      const time = Graph.getTimestamp();

      assert(await item.providesParent(null, time)).to.beNull();
    });
  });

  describe('renderDeleteable_', () => {
    it(`should return true if the parent is ThothFolder`, () => {
      const parent = ThothFolder.newInstance('id', 'name', null, ImmutableSet.of([]));

      assert(item.renderDeleteable_(parent)).to.beTrue();
    });

    it(`should return false if the parent is not ThothFolder`, () => {
      const parent = DriveFolder
          .newInstance('parentId', 'parentName', null, ImmutableSet.of([]), 'driveId');

      assert(item.renderDeleteable_(parent)).to.beFalse();
    });

    it(`should return false if the parent is null`, () => {
      assert(item.renderDeleteable_(null)).to.beFalse();
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
