import { assert, TestBase } from '../test-base';
TestBase.setup();

import { FakeDataGraph } from 'external/gs_tools/src/datamodel';
import { FLAGS as GraphFlags, Graph } from 'external/gs_tools/src/graph';
import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { DriveFile } from 'src/data/drive-file';
import {
  $items,
  DriveFolder,
  FileType,
  Item,
  ItemService,
  PreviewFile } from '../data';
import { HandlebarsService } from '../render/handlebars-service';
import { RenderServiceClass } from '../render/render-service';
import { ShowdownService } from '../render/showdown-service';


describe('render.RenderServiceClass', () => {
  let service: RenderServiceClass;

  beforeEach(() => {
    service = new RenderServiceClass();
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
      const id = `parentId/id`;

      const childId = 'childId';
      const originalItem = DriveFolder
          .newInstance(id, 'name', null, ImmutableSet.of([childId]), 'driveId');
      const childItem = DriveFile
            .newInstance(childId, 'name', id, FileType.UNKNOWN, 'content', 'driveId');

      const itemGraph = new FakeDataGraph<Item>();
      itemGraph.set(id, originalItem);
      itemGraph.set(childId, childItem);

      Graph.clearNodesForTests([$items]);
      Graph.createProvider($items, itemGraph);

      spyOn(service, 'render').and.callThrough();

      await service.render(id, time);
      assert(service.render).to.haveBeenCalledWith(childId, time);
    });

    it(`should create the preview items for a file correctly`, async () => {
      const time = Graph.getTimestamp();
      const id = `parentId/id`;
      const content = 'content';

      const handlebarsContent = 'handlebarsContent';
      const showdownContent = 'showdownContent';
      spyOn(ShowdownService, 'render').and.returnValue(showdownContent);
      spyOn(HandlebarsService, 'render').and.returnValue(handlebarsContent);

      const originalItem = DriveFile
            .newInstance(id, 'name', 'parentId', FileType.ASSET, content, 'driveId');
      const itemGraph = new FakeDataGraph<Item>();
      itemGraph.set(id, originalItem);

      Graph.clearNodesForTests([$items]);
      Graph.createProvider($items, itemGraph);

      const spySavePreview = spyOn(ItemService, 'savePreview');

      await service.render(id, time);

      const item: PreviewFile = spySavePreview.calls.argsFor(0)[1];
      assert(item.getId()).to.equal(id);
      assert(item.getContent()).to.equal(handlebarsContent);

      assert(ItemService.savePreview).to.haveBeenCalledWith(time, item);

      assert(ShowdownService.render).to.haveBeenCalledWith(content);
      assert(HandlebarsService.render).to.haveBeenCalledWith(showdownContent);
    });

    it(`should reject if the item type is not a file or a folder`, async () => {
      const time = Graph.getTimestamp();
      const id = `parentId/id`;

      const itemGraph = new FakeDataGraph<Item>();

      Graph.clearNodesForTests([$items]);
      Graph.createProvider($items, itemGraph);

      await assert(service.render(id, time)).to.rejectWithError(/item for id/i);
    });

    it(`should do nothing the existing preview item if one exists`, async () => {
      const time = Graph.getTimestamp();
      const parentId = '/parentId';
      const id = `${parentId}/id`;

      const childId = 'childId';
      const itemGraph = new FakeDataGraph<Item>();

      Graph.clearNodesForTests([$items]);
      Graph.createProvider($items, itemGraph);

      const previewItem = DriveFolder
          .newInstance(id, 'name', null, ImmutableSet.of([childId]), 'driveId');
      spyOn(ItemService, 'getPreview').and.returnValue(Promise.resolve(previewItem));

      spyOn(ItemService, 'savePreview');

      await service.render(id, time);
      assert(ItemService.savePreview).toNot.haveBeenCalled();
    });
  });
});
