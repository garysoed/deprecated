import { assert, Fakes, Matchers, Mocks, TestBase } from '../test-base';
TestBase.setup();

import { FakeDataGraph } from 'external/gs_tools/src/datamodel';
import { FLAGS as GraphFlags, Graph } from 'external/gs_tools/src/graph';
import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { DriveFile } from 'src/data/drive-file';
import { $items, ItemService, ItemType } from '../data';
import { DriveFolder } from '../data/drive-folder';
import { ItemImpl } from '../data/item-impl';
import { PreviewFile } from '../data/preview-file';
import { PreviewFolder } from '../data/preview-folder';
import { ThothFolder } from '../data/thoth-folder';
import { RenderServiceClass } from '../render/render-service';
import { ShowdownService } from '../render/showdown-service';


describe('render.RenderServiceClass', () => {
  let service: RenderServiceClass;

  beforeEach(() => {
    service = new RenderServiceClass();
  });

  describe('getPreviewId', () => {
    it(`should return the correct ID`, async () => {
      const id = '/a/b/c/d/e';
      const time = Graph.getTimestamp();
      spyOn(ItemService, 'findFirstEditableAncestorPath').and
          .returnValue(Promise.resolve(['/a/b', '/a/b/c', '/a/b/c/d', '/a/b/c/d/e']));

      assert(await service.getPreviewId(id, time)).to.equal('/a/b/$$c/d/e');
      assert(ItemService.findFirstEditableAncestorPath).to.haveBeenCalledWith(id, time);
    });

    it(`should reject if there are no editable ancestors`, async () => {
      const id = '/a/b/c/d/e';
      const time = Graph.getTimestamp();
      spyOn(ItemService, 'findFirstEditableAncestorPath').and.returnValue(Promise.resolve(null));

      await assert(service.getPreviewId(id, time)).to.rejectWithError(/should exist/);
    });
  });

  describe('render', () => {
    beforeEach(() => {
      GraphFlags.checkValueType = false;
    });

    afterEach(() => {
      GraphFlags.checkValueType = true;
    });

    it(`should create the preview items for a folder correctly and resolve with the preview ID`,
        async () => {
      const time = Graph.getTimestamp();
      const previewName = '$$previewName';
      const parentId = '/parentId';
      const id = `${parentId}/id`;
      const previewId = `${parentId}/${previewName}`;

      const childId = 'childId';
      const originalItem = DriveFolder.newInstance(id, 'name', null, ImmutableSet.of([childId]));

      const previewChildId = 'previewChildId';
      const previewChildItem = PreviewFile.newInstance(previewId, 'name', id, 'content', childId);
      const parentItem = ThothFolder.newInstance(parentId, 'parent', null, ImmutableSet.of([]));
      const itemGraph = new FakeDataGraph<ItemImpl>();
      itemGraph.set(id, originalItem);
      itemGraph.set(previewChildId, previewChildItem);
      itemGraph.set(parentId, parentItem);

      spyOn(ItemService, 'findFirstEditableAncestorPath').and
          .returnValue(Promise.resolve([parentId, id]));

      Graph.clearNodesForTests([$items]);
      Graph.createProvider($items, itemGraph);

      Fakes.build(spyOn(service, 'getPreviewId'))
          .when(id, time).resolve(previewId)
          .when(childId, time).resolve(previewChildId);

      const spySave = spyOn(ItemService, 'save');

      assert(await service.render(id, time)).to.equal(previewId);
      assert(ItemService.save).to
          .haveBeenCalledWith(time, Matchers.anyThing(), Matchers.anyThing());

      const item: PreviewFolder = spySave.calls.argsFor(0)[1];
      assert(item.getId()).to.equal(previewId);
      assert(item.getName()).to.equal(previewName);
      assert(item.getParentId()).to.equal(parentId);
      assert(item.getItems()).to.haveElements([previewChildId]);
      assert(item.getOriginalId()).to.equal(id);

      const actualParentItem: ThothFolder = spySave.calls.argsFor(0)[2];
      assert(actualParentItem.getItems()).to.haveElements([previewId]);

      assert(ItemService.findFirstEditableAncestorPath).to.haveBeenCalledWith(id, time);
      assert(service.getPreviewId).to.haveBeenCalledWith(id, time);
    });

    it(`should create the preview items for a file correctly and resolve with the preview ID`,
        async () => {
      const time = Graph.getTimestamp();
      const previewName = '$$previewName';
      const parentId = '/parentId';
      const id = `${parentId}/id`;
      const previewId = `${parentId}/${previewName}`;
      const content = 'content';

      const renderedContent = 'renderedContent';
      spyOn(ShowdownService, 'render').and.returnValue(renderedContent);

      const originalItem = DriveFile.newInstance(id, 'name', 'parentId', ItemType.ASSET, content);
      const parentItem = ThothFolder.newInstance(parentId, 'parent', null, ImmutableSet.of([]));
      const itemGraph = new FakeDataGraph<ItemImpl>();
      itemGraph.set(id, originalItem);
      itemGraph.set(parentId, parentItem);

      spyOn(ItemService, 'findFirstEditableAncestorPath').and
          .returnValue(Promise.resolve([parentId, id]));

      Graph.clearNodesForTests([$items]);
      Graph.createProvider($items, itemGraph);

      Fakes.build(spyOn(service, 'getPreviewId'))
          .when(id, time).resolve(previewId);

      const spySave = spyOn(ItemService, 'save');

      assert(await service.render(id, time)).to.equal(previewId);
      assert(ItemService.save).to
          .haveBeenCalledWith(time, Matchers.anyThing(), Matchers.anyThing());

      const item: PreviewFile = spySave.calls.argsFor(0)[1];
      assert(item.getId()).to.equal(previewId);
      assert(item.getName()).to.equal(previewName);
      assert(item.getParentId()).to.equal(parentId);
      assert(item.getContent()).to.equal(renderedContent);
      assert(item.getOriginalId()).to.equal(id);

      const actualParentItem: ThothFolder = spySave.calls.argsFor(0)[2];
      assert(actualParentItem.getItems()).to.haveElements([previewId]);

      assert(ItemService.findFirstEditableAncestorPath).to.haveBeenCalledWith(id, time);
      assert(service.getPreviewId).to.haveBeenCalledWith(id, time);
      assert(ShowdownService.render).to.haveBeenCalledWith(content);
    });

    it(`should reject if the item type is not a file or a folder`, async () => {
      const time = Graph.getTimestamp();
      const previewName = '$$previewName';
      const parentId = '/parentId';
      const id = `${parentId}/id`;
      const previewId = `${parentId}/${previewName}`;

      const renderedContent = 'renderedContent';
      spyOn(ShowdownService, 'render').and.returnValue(renderedContent);

      const originalItem = Mocks.object('originalItem');
      const parentItem = ThothFolder.newInstance(parentId, 'parent', null, ImmutableSet.of([]));
      const itemGraph = new FakeDataGraph<ItemImpl>();
      itemGraph.set(id, originalItem);
      itemGraph.set(parentId, parentItem);

      spyOn(ItemService, 'findFirstEditableAncestorPath').and
          .returnValue(Promise.resolve([parentId, id]));

      Graph.clearNodesForTests([$items]);
      Graph.createProvider($items, itemGraph);

      Fakes.build(spyOn(service, 'getPreviewId'))
          .when(id, time).resolve(previewId);

      await assert(service.render(id, time)).to.rejectWithError(/a File or Folder/);
    });

    it(`should reject if the editable ancestor is not editable`, async () => {
      const time = Graph.getTimestamp();
      const previewName = '$$previewName';
      const parentId = '/parentId';
      const id = `${parentId}/id`;
      const previewId = `${parentId}/${previewName}`;

      const renderedContent = 'renderedContent';
      spyOn(ShowdownService, 'render').and.returnValue(renderedContent);

      const originalItem = Mocks.object('originalItem');
      const parentItem = DriveFolder.newInstance(parentId, 'parent', null, ImmutableSet.of([]));
      const itemGraph = new FakeDataGraph<ItemImpl>();
      itemGraph.set(id, originalItem);
      itemGraph.set(parentId, parentItem);

      spyOn(ItemService, 'findFirstEditableAncestorPath').and
          .returnValue(Promise.resolve([parentId, id]));

      Graph.clearNodesForTests([$items]);
      Graph.createProvider($items, itemGraph);

      Fakes.build(spyOn(service, 'getPreviewId'))
          .when(id, time).resolve(previewId);

      await assert(service.render(id, time)).to.rejectWithError(/an editable folder/);
    });

    it(`should reject if the item does not exist`, async () => {
      const time = Graph.getTimestamp();
      const previewName = '$$previewName';
      const parentId = '/parentId';
      const id = `${parentId}/id`;
      const previewId = `${parentId}/${previewName}`;

      const renderedContent = 'renderedContent';
      spyOn(ShowdownService, 'render').and.returnValue(renderedContent);

      const parentItem = DriveFolder.newInstance(parentId, 'parent', null, ImmutableSet.of([]));
      const itemGraph = new FakeDataGraph<ItemImpl>();
      itemGraph.set(parentId, parentItem);

      Graph.clearNodesForTests([$items]);
      Graph.createProvider($items, itemGraph);

      Fakes.build(spyOn(service, 'getPreviewId'))
          .when(id, time).resolve(previewId);

      await assert(service.render(id, time)).to.rejectWithError(/should exist/);
    });

    it(`should return the existing preview item if one exists`, async () => {
      const time = Graph.getTimestamp();
      const previewName = '$$previewName';
      const parentId = '/parentId';
      const id = `${parentId}/id`;
      const previewId = `${parentId}/${previewName}`;

      const childId = 'childId';
      const previewItem = DriveFolder
          .newInstance(previewId, 'name', null, ImmutableSet.of([childId]));
      const itemGraph = new FakeDataGraph<ItemImpl>();
      itemGraph.set(previewId, previewItem);

      Graph.clearNodesForTests([$items]);
      Graph.createProvider($items, itemGraph);

      Fakes.build(spyOn(service, 'getPreviewId'))
          .when(id, time).resolve(previewId);

      spyOn(ItemService, 'save');

      assert(await service.render(id, time)).to.equal(previewId);
      assert(ItemService.save).toNot.haveBeenCalled();
    });
  });
});
