import { assert, Fakes, Matchers, Mocks, TestBase } from '../test-base';
TestBase.setup();

import { ImmutableMap, ImmutableSet } from 'external/gs_tools/src/immutable';
import { Paths } from 'external/gs_tools/src/path';

import {
  DataFile,
  DriveFolder,
  MarkdownFile,
  PreviewFile } from '../data';
import { ProcessorFile } from '../data/processor-file';
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
    mockItemService = jasmine.createSpyObj('ItemService', ['getItem', 'getItemByPath', 'getPath']);
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
      const content = 'content';
      const item = MarkdownFile.newInstance(
          'itemId',
          'itemName',
          'parentId',
          content,
          ThothSource.newInstance());

      const showdownConfig = ImmutableMap.of([['key', 'value']]);
      const config = {
        processor: null,
        showdownConfig,
        template: null,
        variables: ImmutableMap.of<string, string>([]),
      };

      const renderedMarkdown = 'renderedMarkdown';
      spyOn(ShowdownService, 'render').and.returnValue(renderedMarkdown);

      assert(service['compileItem_'](item, config)).to.equal(renderedMarkdown);
      assert(ShowdownService.render).to.haveBeenCalledWith(content, showdownConfig);
    });

    it(`should compile data files correctly`, () => {
      const content = Mocks.object('content');
      const item = DataFile.newInstance(
          'itemId',
          'itemName',
          'parentId',
          content,
          ThothSource.newInstance());

      const showdownConfig = Mocks.object('showdownConfig');
      const config = {
        processor: null,
        showdownConfig,
        template: null,
        variables: ImmutableMap.of<string, string>([]),
      };
      assert(service['compileItem_'](item, config)).to.equal(content);
    });
  });

  describe('processOutputMap_', () => {
    it(`should return the correct map`, async () => {
      const originalMap = ImmutableMap.of([['a', 1]]);
      const newOutputMap = ImmutableMap.of([['b', 2]]);
      const mockProcessorFn = jasmine.createSpy('ProcessorFn');
      mockProcessorFn.and.returnValue(newOutputMap);
      const mockProcessor = jasmine.createSpyObj('Processor', ['getFunction']);
      mockProcessor.getFunction.and.returnValue(mockProcessorFn);
      Object.setPrototypeOf(mockProcessor, ProcessorFile.prototype);
      mockItemService.getItemByPath.and.returnValue(Promise.resolve(mockProcessor));

      const processorPath = Paths.absolutePath('/processor');
      const config = {
        processor: processorPath,
        showdownConfig: ImmutableMap.of<string, string>([]),
        template: null,
        variables: ImmutableMap.of<string, string>([]),
      };
      assert(await service['processOutputMap_'](originalMap, config)).to
          .haveElements([...newOutputMap]);
      assert(mockItemService.getItemByPath).to.haveBeenCalledWith(processorPath);
      assert(mockProcessorFn).to.haveBeenCalledWith([...originalMap]);
    });

    it(`should reject if processor item is not a ProcessorFile`, async () => {
      const mockProcessor = jasmine.createSpyObj('Processor', ['getFunction']);
      mockItemService.getItemByPath.and.returnValue(Promise.resolve(mockProcessor));

      const config = {
        processor: Paths.absolutePath('/processor'),
        showdownConfig: ImmutableMap.of<string, string>([]),
        template: null,
        variables: ImmutableMap.of<string, string>([]),
      };
      await assert(service['processOutputMap_'](ImmutableMap.of([['a', 1]]), config)).to
          .rejectWithError(/a ProcessorFile/);
    });

    it(`should return the original map if there are no processors`, async () => {
      const originalMap = ImmutableMap.of([['a', 1]]);

      const config = {
        processor: null,
        showdownConfig: ImmutableMap.of<string, string>([]),
        template: null,
        variables: ImmutableMap.of<string, string>([]),
      };
      assert(await service['processOutputMap_'](originalMap, config)).to
          .haveElements([...originalMap]);
    });
  });

  describe('render', () => {
    it(`should create the preview items for a file correctly`, async () => {
      const id = `parentId/id`;
      const content = 'content';

      const renderedContent = 'handlebarsContent';

      const filename = 'filename';
      const originalItem = MarkdownFile.newInstance(
          id, filename, 'parentId', content, DriveSource.newInstance('driveId'));

      Fakes.build(mockItemService.getItem)
          .when(id).return(originalItem);

      const parentFolder = '/parent';
      const path = Paths.absolutePath(`${parentFolder}/path`);
      mockItemService.getPath.and.returnValue(Promise.resolve(path));

      const templateContent = 'templateContent';
      spyOn(service, 'getTemplateContent_').and.returnValue(templateContent);

      const renderConfig = {
        processor: Paths.absolutePath('/processor'),
        showdownConfig: ImmutableMap.of<string, string>([]),
        template: Paths.absolutePath('/template'),
        variables: ImmutableMap.of<string, string>([]),
      };
      mockMetadataService.getConfigForItem.and.returnValue(renderConfig);

      spyOn(service, 'renderItem_').and.returnValue(renderedContent);

      const compiledItem = 'compiledItem';
      spyOn(service, 'compileItem_').and.returnValue(compiledItem);

      const processedContent = Mocks.object('processedContent');
      const processedName = 'processedName';
      const processOutputMapSpy = spyOn(service, 'processOutputMap_').and
          .returnValue(Promise.resolve(ImmutableMap.of([
            [processedName, processedContent],
          ])));

      await service.render(id);

      const previewFile: PreviewFile = mockPreviewService.save.calls.argsFor(0)[0];
      assert(previewFile.getPath()).to.equal(`${parentFolder}/${processedName}`);
      assert(previewFile.getContent()).to.equal(renderedContent);

      assert(mockPreviewService.save).to.haveBeenCalledWith(previewFile);
      assert(mockMetadataService.getConfigForItem).to.haveBeenCalledWith(id);

      assert(service['renderItem_']).to.haveBeenCalledWith(
          processedContent,
          templateContent,
          renderConfig);
      assert(service['processOutputMap_']).to.haveBeenCalledWith(
          Matchers.any<ImmutableMap<string, {}>>(ImmutableMap),
          renderConfig);
      assert(processOutputMapSpy.calls.argsFor(0)[0] as ImmutableMap<string, {}>).to
          .haveElements([[filename, {$mainContent: compiledItem}]]);
      assert(service['compileItem_']).to.haveBeenCalledWith(originalItem, renderConfig);
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
