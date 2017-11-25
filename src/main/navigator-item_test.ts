import { assert, Matchers, Mocks, TestBase, TestDispose } from '../test-base';
TestBase.setup();

import { Graph } from 'external/gs_tools/src/graph';
import { ImmutableSet } from 'external/gs_tools/src/immutable';
import { $location } from 'external/gs_tools/src/ui';

import { Persona } from 'external/gs_tools/src/persona';
import {
  $driveService,
  $itemService,
  DriveFile,
  DriveFolder,
  FileType,
  Item,
  ThothFolder} from '../data';
import { $, $isEditing, $item, $parent, NavigatorItem } from '../main/navigator-item';
import { $renderService } from '../render';

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
      Graph.setForTest($.host.itemid.getId(), idDelete);

      const parent = ThothFolder
          .newInstance('idParent', 'name', null, ImmutableSet.of([idOld, idDelete]));
      Graph.setForTest($parent, parent);

      const mockItemService = jasmine.createSpyObj('ItemService', ['save']);
      Graph.setForTest($itemService, mockItemService);

      await item.onDeleteButtonAction_();
      assert(mockItemService.save).to.haveBeenCalledWith(Matchers.anyThing());

      const newParent: ThothFolder = mockItemService.save.calls.argsFor(0)[0];
      assert(newParent.getItems()).to.haveElements([idOld]);
    });

    it(`should not save if the parent is not a ThothFolder`, async () => {
      const idDelete = 'idDelete';
      Graph.setForTest($.host.itemid.getId(), idDelete);

      const parent = DriveFolder
          .newInstance('idParent', 'name', null, ImmutableSet.of([]), 'driveId');
      Graph.setForTest($parent, parent);

      const mockItemService = jasmine.createSpyObj('ItemService', ['save']);
      Graph.setForTest($itemService, mockItemService);

      await item.onDeleteButtonAction_();
      assert(mockItemService.save).toNot.haveBeenCalled();
    });

    it(`should not save if the parent is null`, async () => {
      const idDelete = 'idDelete';
      Graph.setForTest($.host.itemid.getId(), idDelete);

      Graph.setForTest($parent, null);

      const mockItemService = jasmine.createSpyObj('ItemService', ['save']);
      Graph.setForTest($itemService, mockItemService);

      await item.onDeleteButtonAction_();
      assert(mockItemService.save).toNot.haveBeenCalled();
    });

    it(`should not save if itemId does not exist`, async () => {
      Graph.setForTest($.host.itemid.getId(), '');

      const parent = ThothFolder
          .newInstance('idParent', 'name', null, ImmutableSet.of([]));
      Graph.setForTest($parent, parent);

      const mockItemService = jasmine.createSpyObj('ItemService', ['save']);
      Graph.setForTest($itemService, mockItemService);

      await item.onDeleteButtonAction_();
      assert(mockItemService.save).toNot.haveBeenCalled();
    });
  });

  describe('onHostClick_', () => {
    it(`should navigate to the correct item`, async () => {
      const name = 'name';

      const path = 'path';
      Graph.setForTest($location.path, path);
      Graph.setForTest($isEditing, false);
      Graph.setForTest(
          $item,
          ThothFolder.newInstance('id', name, null, ImmutableSet.of([])));

      await item.onHostClick_();
      assert(window.location.hash).to.equal(`#/${path}/${name}`);

      window.location.hash = '';
    });

    it(`should do nothing if there are no items`, async () => {
      Graph.setForTest($item, null);
      Graph.setForTest($isEditing, false);

      await item.onHostClick_();
      assert(window.location.hash).to.equal('');
    });

    it(`should do nothing if editing`, async () => {
      Graph.setForTest($item, null);
      Graph.setForTest($isEditing, true);

      await item.onHostClick_();
      assert(window.location.hash).to.equal('');
    });
  });

  describe('onRefreshButtonAction_', () => {
    it(`should get and save the items again for files`, async () => {
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);

      const item1 = Mocks.object('item1');
      const item2 = Mocks.object('item2');
      const mockDriveService = jasmine.createSpyObj('DriveService', ['recursiveGet']);
      mockDriveService.recursiveGet.and.returnValue(Promise.resolve(ImmutableSet.of([
        item1,
        item2,
      ])));
      Graph.setForTest($driveService, mockDriveService);

      const mockItemService = jasmine.createSpyObj('ItemService', ['save']);
      Graph.setForTest($itemService, mockItemService);

      const parentId = 'parentId';
      const driveId = 'driveId';
      const driveItem = DriveFile
          .newInstance('id', 'name', parentId, FileType.ASSET, 'content', driveId);
      Graph.setForTest($item, driveItem);

      await item.onRefreshButtonAction_(mockEvent);
      assert(mockItemService.save).to.haveBeenCalledWith(item1);
      assert(mockItemService.save).to.haveBeenCalledWith(item2);
      assert(mockDriveService.recursiveGet).to.haveBeenCalledWith(driveId, parentId);
      assert(mockEvent.stopPropagation).to.haveBeenCalledWith();
    });

    it(`should get and save the items again for folders`, async () => {
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);

      const item1 = Mocks.object('item1');
      const item2 = Mocks.object('item2');
      const mockDriveService = jasmine.createSpyObj('DriveService', ['recursiveGet']);
      mockDriveService.recursiveGet.and.returnValue(Promise.resolve(ImmutableSet.of([
        item1,
        item2,
      ])));
      Graph.setForTest($driveService, mockDriveService);

      const mockItemService = jasmine.createSpyObj('ItemService', ['save']);
      Graph.setForTest($itemService, mockItemService);

      const parentId = 'parentId';
      const driveId = 'driveId';
      const driveItem = DriveFolder
          .newInstance('id', 'name', parentId, ImmutableSet.of([]), driveId);
      Graph.setForTest($item, driveItem);

      await item.onRefreshButtonAction_(mockEvent);
      assert(mockItemService.save).to.haveBeenCalledWith(item1);
      assert(mockItemService.save).to.haveBeenCalledWith(item2);
      assert(mockDriveService.recursiveGet).to.haveBeenCalledWith(driveId, parentId);
      assert(mockEvent.stopPropagation).to.haveBeenCalledWith();
    });

    it(`should not reject if the item has no parent IDs`, async () => {
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);

      const item1 = Mocks.object('item1');
      const item2 = Mocks.object('item2');
      const mockDriveService = jasmine.createSpyObj('DriveService', ['recursiveGet']);
      mockDriveService.recursiveGet.and.returnValue(Promise.resolve(ImmutableSet.of([
        item1,
        item2,
      ])));

      const mockItemService = jasmine.createSpyObj('ItemService', ['save']);
      Graph.setForTest($itemService, mockItemService);

      const driveId = 'driveId';
      const driveItem = DriveFolder
          .newInstance('id', 'name', null, ImmutableSet.of([]), driveId);
      Graph.setForTest($item, driveItem);

      await assert(item.onRefreshButtonAction_(mockEvent)).to.rejectWithError(/should exist/);
      assert(mockEvent.stopPropagation).to.haveBeenCalledWith();
    });

    it(`should not reject if the item is not a DriveFile or DriveFolder`, async () => {
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);


      const mockItemService = jasmine.createSpyObj('ItemService', ['save']);
      Graph.setForTest($itemService, mockItemService);

      const parentId = 'parentId';
      const driveItem = ThothFolder.newInstance('id', 'name', parentId, ImmutableSet.of([]));
      Graph.setForTest($item, driveItem);

      await item.onRefreshButtonAction_(mockEvent);
      assert(mockItemService.save).toNot.haveBeenCalled();
      assert(mockEvent.stopPropagation).to.haveBeenCalledWith();
    });
  });

  describe('onRenameButtonAction_', () => {
    it(`should set the input to the name and set the edit flag if not editing`, async () => {
      const itemName = 'itemName';
      const shadowRoot = Mocks.object('shadowRoot');
      spyOn(Persona, 'getShadowRoot').and.returnValue(shadowRoot);


      const selectedItem = ThothFolder.newInstance('id', itemName, null, ImmutableSet.of([]));
      Graph.setForTest($isEditing, false);
      Graph.setForTest($item, selectedItem);

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

      const selectedItem = ThothFolder.newInstance('id', 'itemName', null, ImmutableSet.of([]));
      Graph.setForTest($isEditing, true);
      Graph.setForTest($item, selectedItem);

      const mockItemService = jasmine.createSpyObj('ItemService', ['save']);
      Graph.setForTest($itemService, mockItemService);

      const newName = 'newName';
      spyOn($.nameInput.value, 'getValue').and.returnValue(newName);

      await item.onRenameButtonAction_();
      assert(await Graph.get($isEditing, Graph.getTimestamp(), item)).to.beFalse();

      assert(mockItemService.save).to.haveBeenCalledWith(Matchers.anyThing());
      const newItem: Item = mockItemService.save.calls.argsFor(0)[0];
      assert(newItem.getName()).to.equal(newName);
      assert($.nameInput.value.getValue).to.haveBeenCalledWith(shadowRoot);
      assert(Persona.getShadowRoot).to.haveBeenCalledWith(item);
    });

    it(`should not save the new name if the new name is empty`, async () => {
      const shadowRoot = Mocks.object('shadowRoot');
      spyOn(Persona, 'getShadowRoot').and.returnValue(shadowRoot);

      const selectedItem = ThothFolder.newInstance('id', 'itemName', null, ImmutableSet.of([]));
      Graph.setForTest($isEditing, true);
      Graph.setForTest($item, selectedItem);

      const mockItemService = jasmine.createSpyObj('ItemService', ['save']);
      Graph.setForTest($itemService, mockItemService);

      spyOn($.nameInput.value, 'getValue').and.returnValue('');

      await item.onRenameButtonAction_();
      assert(await Graph.get($isEditing, Graph.getTimestamp(), item)).to.beFalse();

      assert(mockItemService.save).toNot.haveBeenCalled();
      assert($.nameInput.value.getValue).to.haveBeenCalledWith(shadowRoot);
      assert(Persona.getShadowRoot).to.haveBeenCalledWith(item);
    });

    it(`should do nothing if there are no items`, async () => {
      const shadowRoot = Mocks.object('shadowRoot');
      spyOn(Persona, 'getShadowRoot').and.returnValue(shadowRoot);

      Graph.setForTest($isEditing, true);
      Graph.setForTest($item, null);

      const mockItemService = jasmine.createSpyObj('ItemService', ['save']);
      Graph.setForTest($itemService, mockItemService);

      spyOn($.nameInput.value, 'getValue').and.returnValue('');

      await item.onRenameButtonAction_();
      assert(await Graph.get($isEditing, Graph.getTimestamp(), item)).to.beTrue();

      assert(mockItemService.save).toNot.haveBeenCalled();
      assert(Persona.getShadowRoot).to.haveBeenCalledWith(item);
    });

    it(`should do nothing if shadow roots cannot be found`, async () => {
      spyOn(Persona, 'getShadowRoot').and.returnValue(null);


      Graph.setForTest($isEditing, true);
      Graph.setForTest($item, null);


      const mockItemService = jasmine.createSpyObj('ItemService', ['save']);
      Graph.setForTest($itemService, mockItemService);

      spyOn($.nameInput.value, 'getValue').and.returnValue('');

      await item.onRenameButtonAction_();
      assert(await Graph.get($isEditing, Graph.getTimestamp(), item)).to.beTrue();

      assert(mockItemService.save).toNot.haveBeenCalled();
      assert(Persona.getShadowRoot).to.haveBeenCalledWith(item);
    });
  });

  describe('onRenderButtonAction_', () => {
    it(`should render the item correctly`, async () => {
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);
      const id = 'id';
      const driveItem = DriveFile
          .newInstance(id, 'name', 'parentId', FileType.ASSET, 'content', 'driveId');
      Graph.setForTest($item, driveItem);

      const mockRenderService = jasmine.createSpyObj('RenderService', ['render']);
      Graph.setForTest($renderService, mockRenderService);

      await item.onRenderButtonAction_(mockEvent);
      assert(mockRenderService.render).to.haveBeenCalledWith(id);
    });

    it(`should not reject if the item is not a FileImpl`, async () => {
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);
      Graph.setForTest($item, null);

      const mockRenderService = jasmine.createSpyObj('RenderService', ['render']);
      Graph.setForTest($renderService, mockRenderService);

      await item.onRenderButtonAction_(mockEvent);
      assert(mockRenderService.render).toNot.haveBeenCalled();
    });
  });

  describe('providesItem', () => {
    it(`should resolve with the correct item`, async () => {
      const id = 'id';
      const selectedItem = DriveFile
          .newInstance(id, 'name', 'parentId', FileType.ASSET, 'content', 'driveId');

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
      const driveItem = DriveFile
          .newInstance('id', 'name', parentId, FileType.ASSET, 'content', 'driveId');

      const parent = ThothFolder.newInstance('parentId', 'parentName', null, ImmutableSet.of([]));
      const mockItemService = jasmine.createSpyObj('ItemService', ['getItem']);
      mockItemService.getItem.and.returnValue(Promise.resolve(parent));

      assert(await item.providesParent(driveItem, mockItemService)).to.equal(parent);
      assert(mockItemService.getItem).to.haveBeenCalledWith(parentId);
    });

    it(`should return null if there are no parent IDs`, async () => {
      const driveItem = DriveFolder
          .newInstance('id', 'name', null, ImmutableSet.of([]), 'driveId');

      const mockItemService = jasmine.createSpyObj('ItemService', ['getItem']);

      assert(await item.providesParent(driveItem, mockItemService)).to.beNull();
    });

    it(`should return null if there are no items`, async () => {
      const mockItemService = jasmine.createSpyObj('ItemService', ['getItem']);

      assert(await item.providesParent(null, mockItemService)).to.beNull();
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
