import { assert, Fakes, TestBase } from '../test-base';
TestBase.setup();

import { ImmutableMap, ImmutableSet } from 'external/gs_tools/src/immutable';
import { Paths } from 'external/gs_tools/src/path';

import {
  DriveFolder,
  MarkdownFile,
  PreviewFile,
  RenderConfig,
  UnknownFile } from '../data';
import { DriveSource, ThothSource } from '../datasource';
import { RenderService } from '../render/render-service';
import { ShowdownService } from '../render/showdown-service';

describe('render.RenderServiceClass', () => {
  let mockItemService: any;
  let mockMetadataService: any;
  let mockPreviewService: any;
  let mockTemplates: any;
  let service: RenderService;

  beforeEach(() => {
    mockItemService = jasmine.createSpyObj('ItemService', ['getItem', 'getPath']);
    mockMetadataService = jasmine.createSpyObj('MetadataService', ['getConfigForItem']);
    mockPreviewService = jasmine.createSpyObj('PreviewService', ['get', 'save']);
    mockTemplates = jasmine.createSpyObj('Templates', ['getTemplate']);
    service = new RenderService(
        mockItemService,
        mockMetadataService,
        mockPreviewService,
        mockTemplates);
  });

  describe('compileItem_', () => {
    it(`should compile markdown files correctly`, () => {
      const itemName = 'itemName';
      const content = 'content';
      const item = MarkdownFile.newInstance(
          'itemId',
          itemName,
          'parentId',
          content,
          ThothSource.newInstance());

      const showdownConfig = ImmutableMap.of([['key', 'value']]);
      const config = new RenderConfig(showdownConfig, null, ImmutableMap.of([]));

      const renderedMarkdown = 'renderedMarkdown';
      spyOn(ShowdownService, 'render').and.returnValue(renderedMarkdown);

      assert(service['compileItem_'](item, config)).to.haveElements([[itemName, renderedMarkdown]]);
      assert(ShowdownService.render).to.haveBeenCalledWith(content, showdownConfig);
    });
  });

  describe('render', () => {
    it(`should create the preview items for a folder correctly and resolve with the preview ID`,
        async () => {
      const id = `id`;

      const childId = 'childId';
      const originalItem = DriveFolder.newInstance(
          id, 'name', null, ImmutableSet.of([childId]), DriveSource.newInstance('driveId'));
      const childItem = UnknownFile.newInstance(
          childId, 'name', id, DriveSource.newInstance('driveId'));

      Fakes.build(mockItemService.getItem)
          .when(id).return(originalItem)
          .when(childId).return(childItem);

      mockItemService.getPath.and.returnValue(Promise.resolve(Paths.absolutePath('/path')));

      spyOn(service, 'render').and.callThrough();

      await service.render(id);
      assert(service.render).to.haveBeenCalledWith(childId);
    });

    it(`should create the preview items for a file correctly`, async () => {
      const id = `parentId/id`;
      const content = 'content';

      const renderedContent = 'handlebarsContent';

      const originalItem = MarkdownFile.newInstance(
          id, 'name', 'parentId', content, DriveSource.newInstance('driveId'));

      Fakes.build(mockItemService.getItem)
          .when(id).return(originalItem);

      const parentFolder = '/parent';
      const path = Paths.absolutePath(`${parentFolder}/path`);
      mockItemService.getPath.and.returnValue(Promise.resolve(path));

      const templateContent = 'templateContent';
      spyOn(service, 'getTemplateContent_').and.returnValue(templateContent);

      const renderConfig = new RenderConfig(
          ImmutableMap.of([]),
          Paths.absolutePath('/template'),
          ImmutableMap.of([]));
      mockMetadataService.getConfigForItem.and.returnValue(renderConfig);

      spyOn(service, 'renderItem_').and.returnValue(renderedContent);

      const compiledPath = 'compiled/path';
      const showdownContent = 'showdownContent';
      spyOn(service, 'compileItem_').and.returnValue(ImmutableMap.of([
        [compiledPath, showdownContent],
      ]));

      await service.render(id);

      const previewFile: PreviewFile = mockPreviewService.save.calls.argsFor(0)[0];
      assert(previewFile.getPath()).to.equal(`${parentFolder}/${compiledPath}`);
      assert(previewFile.getContent()).to.equal(renderedContent);

      assert(mockPreviewService.save).to.haveBeenCalledWith(previewFile);
      assert(mockMetadataService.getConfigForItem).to.haveBeenCalledWith(id);

      assert(service['renderItem_']).to.haveBeenCalledWith(
          showdownContent,
          templateContent,
          renderConfig);
    });

    it(`should reject if the item type is not a file or a folder`, async () => {
      const id = `id`;
      mockItemService.getPath.and.returnValue(Promise.resolve(Paths.absolutePath('/path')));

      await assert(service.render(id)).to.rejectWithError(/item for id/i);
    });

    it(`should do nothing the existing preview item if one exists`, async () => {
      const parentId = '/parentId';
      const id = `${parentId}/id`;

      const childId = 'childId';

      const previewItem = DriveFolder.newInstance(
          id, 'name', null, ImmutableSet.of([childId]), DriveSource.newInstance('driveId'));
      mockPreviewService.get.and.returnValue(Promise.resolve(previewItem));

      mockItemService.getPath.and.returnValue(Promise.resolve('path'));

      await service.render(id);
      assert(mockPreviewService.save).toNot.haveBeenCalled();
    });

    it(`should reject if the item path does not exist`, async () => {
      const id = 'id';
      mockItemService.getPath.and.returnValue(Promise.resolve(null));

      await assert(service.render(id)).to.rejectWithError(/path for item/i);
      assert(mockItemService.getPath).to.haveBeenCalledWith(id);
    });
  });
});
