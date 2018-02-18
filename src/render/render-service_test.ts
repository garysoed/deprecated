import { assert, Fakes, Mocks, TestBase } from '../test-base';
TestBase.setup();

import { ImmutableSet } from 'external/gs_tools/src/immutable';
import { Paths } from 'external/gs_tools/src/path';

import { DriveFile } from 'src/data/drive-file';
import {
  DriveFolder,
  FileType,
  PreviewFile } from '../data';
import { HandlebarsService } from '../render/handlebars-service';
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
    mockMetadataService = jasmine.createSpyObj('MetadataService', ['getMetadataForItem']);
    mockPreviewService = jasmine.createSpyObj('PreviewService', ['get', 'save']);
    mockTemplates = jasmine.createSpyObj('Templates', ['getTemplate']);
    service = new RenderService(
        mockItemService,
        mockMetadataService,
        mockPreviewService,
        mockTemplates);
  });

  describe('render', () => {
    it(`should create the preview items for a folder correctly and resolve with the preview ID`,
        async () => {
      const id = `id`;

      const childId = 'childId';
      const originalItem = DriveFolder
          .newInstance(id, 'name', null, ImmutableSet.of([childId]), 'driveId');
      const childItem = DriveFile
          .newInstance(childId, 'name', id, FileType.UNKNOWN, 'content', 'driveId');

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

      const handlebarsContent = 'handlebarsContent';
      const showdownContent = 'showdownContent';
      spyOn(ShowdownService, 'render').and.returnValue(showdownContent);
      spyOn(HandlebarsService, 'render').and.returnValue(handlebarsContent);

      const originalItem = DriveFile
          .newInstance(id, 'name', 'parentId', FileType.ASSET, content, 'driveId');

      Fakes.build(mockItemService.getItem)
          .when(id).return(originalItem);

      const path = Paths.absolutePath('/path');
      mockItemService.getPath.and.returnValue(Promise.resolve(path));

      const templateContent = 'templateContent';
      spyOn(service, 'getTemplateContent_').and.returnValue(templateContent);

      const showdownConfig = Mocks.object('showdownConfig');
      const mockMetadata = jasmine
          .createSpyObj('Metadata', ['getGlobals', 'getShowdownConfigForPath']);
      const globals = Mocks.object('globals');
      mockMetadata.getGlobals.and.returnValue(globals);
      mockMetadata.getShowdownConfigForPath.and.returnValue(showdownConfig);
      mockMetadataService.getMetadataForItem.and.returnValue(mockMetadata);

      await service.render(id);

      const previewFile: PreviewFile = mockPreviewService.save.calls.argsFor(0)[0];
      assert(previewFile.getPath()).to.equal(path.toString());
      assert(previewFile.getContent()).to.equal(handlebarsContent);

      assert(mockPreviewService.save).to.haveBeenCalledWith(previewFile);
      assert(mockMetadataService.getMetadataForItem).to.haveBeenCalledWith(id);

      assert(ShowdownService.render).to.haveBeenCalledWith(content, showdownConfig);
      assert(mockMetadata.getShowdownConfigForPath).to.haveBeenCalledWith(path);
      assert(HandlebarsService.render).to.haveBeenCalledWith(
          showdownContent,
          templateContent,
          globals);
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

      const previewItem = DriveFolder
          .newInstance(id, 'name', null, ImmutableSet.of([childId]), 'driveId');
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
