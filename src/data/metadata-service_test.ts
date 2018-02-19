import { assert, Fakes, Mocks, PathMatcher, TestBase } from '../test-base';
TestBase.setup();

import { ImmutableSet } from 'external/gs_tools/src/immutable';
import { Paths } from 'external/gs_tools/src/path';

import { DriveFile, DriveFolder, FileType, MetadataService } from '../data';
import { DEFAULT_METADATA } from '../data/metadata-service';
import { DriveSource } from '../datasource';


describe('data.MetadataService', () => {
  let mockItemService: any;
  let mockJsYaml: any;
  let service: MetadataService;

  beforeEach(() => {
    mockItemService = jasmine.createSpyObj('ItemService', [
        'getItem',
        'getItemByPath',
        'getPath']);
    mockJsYaml = jasmine.createSpyObj('JsYaml', ['load']);
    window['jsyaml'] = mockJsYaml;
    service = new MetadataService(mockItemService);
  });

  describe('createMetadata_', () => {
    it(`should return the correct metadata object`, () => {
      const unparsedContent = 'unparsedContent';
      const path = 'path';
      const globals = {a: '1', b: '2'};
      const defaultTemplate = '/defaultTemplate';
      mockJsYaml.load.and.returnValue({
        globals,
        templates: {
          $default: defaultTemplate,
        },
      });

      const metadata = service['createMetadata_'](unparsedContent, path);
      assert(metadata.getGlobals()).to.haveElements([['a', '1'], ['b', '2']]);
      assert(metadata.getDefaultTemplatePath()).to.equal(PathMatcher.with(defaultTemplate));
      assert(jsyaml.load).to.haveBeenCalledWith(unparsedContent);
    });

    it(`should default the default template to null if it isn't specified`, () => {
      const unparsedContent = 'unparsedContent';
      const path = 'path';
      const globals = {a: '1', b: '2'};
      mockJsYaml.load.and.returnValue({
        globals,
        templates: { },
      });

      const metadata = service['createMetadata_'](unparsedContent, path);
      assert(metadata.getGlobals()).to.haveElements([['a', '1'], ['b', '2']]);
      assert(metadata.getDefaultTemplatePath()).to.beNull();
      assert(jsyaml.load).to.haveBeenCalledWith(unparsedContent);
    });

    it(`should default the default template to null if there are no templates objects`, () => {
      const unparsedContent = 'unparsedContent';
      const path = 'path';
      const globals = {a: '1', b: '2'};
      mockJsYaml.load.and.returnValue({
        globals,
      });

      const metadata = service['createMetadata_'](unparsedContent, path);
      assert(metadata.getGlobals()).to.haveElements([['a', '1'], ['b', '2']]);
      assert(metadata.getDefaultTemplatePath()).to.beNull();
      assert(jsyaml.load).to.haveBeenCalledWith(unparsedContent);
    });

    it(`should throw error if the content is not the correct type`, () => {
      const unparsedContent = 'unparsedContent';
      const path = 'path';
      mockJsYaml.load.and.returnValue({
        globals: 1,
      });

      assert(() => {
        service['createMetadata_'](unparsedContent, path);
      }).to.throwError(new RegExp(path));
    });
  });

  describe('getMetadataForItem', () => {
    it(`should return the resolved metadata if one exists in the corrent folder`, async () => {
      const itemId = 'itemId';
      const resolvedItem = Mocks.object('resolvedItem');
      spyOn(service, 'resolveMetadataItem_').and.returnValue(resolvedItem);

      const metadataItem = Mocks.object('metadataItem');
      spyOn(service, 'getMetadataItemInFolder_').and.returnValue(metadataItem);

      const folder = Mocks.object('folder');
      mockItemService.getItemByPath.and.returnValue(folder);

      mockItemService.getPath.and.returnValue(Paths.absolutePath('/a/b/c/item'));

      assert(await service.getMetadataForItem(itemId)).to.equal(resolvedItem);
      assert(service['resolveMetadataItem_']).to.haveBeenCalledWith(metadataItem);
      assert(service['getMetadataItemInFolder_']).to.haveBeenCalledWith(PathMatcher.with('/a/b/c'));
      assert(mockItemService.getItemByPath).to.haveBeenCalledWith(PathMatcher.with('/a/b/c'));
      assert(mockItemService.getPath).to.haveBeenCalledWith(itemId);
    });

    it(`should return the parent folder's metadata if one doesn't exist in the current folder`,
        async () => {
      const itemId = 'itemId';
      const parentResolvedItem = Mocks.object('parentResolvedItem');
      spyOn(service, 'resolveMetadataItem_').and.returnValue(parentResolvedItem);

      const parentMetadataItem = Mocks.object('parentMetadataItem');
      Fakes.build(spyOn(service, 'getMetadataItemInFolder_'))
          .when(PathMatcher.with('/a/b/c')).return(null)
          .when(PathMatcher.with('/a/b')).return(parentMetadataItem);

      const parentItemId = 'parentItemId';
      const mockFolder = jasmine.createSpyObj('Folder', ['getId']);
      mockFolder.getId.and.returnValue(parentItemId);

      const parentFolder = Mocks.object('parentFolder');
      Fakes.build(mockItemService.getItemByPath)
          .when(PathMatcher.with('/a/b/c')).return(mockFolder)
          .when(PathMatcher.with('/a/b')).return(parentFolder);

      Fakes.build(mockItemService.getPath)
          .when(itemId).return(Paths.absolutePath('/a/b/c/item'))
          .when(parentItemId).return(Paths.absolutePath('/a/b/c'));

      assert(await service.getMetadataForItem(itemId)).to.equal(parentResolvedItem);
      assert(service['resolveMetadataItem_']).to.haveBeenCalledWith(parentMetadataItem);
      assert(mockItemService.getPath).to.haveBeenCalledWith(itemId);
      assert(mockItemService.getPath).to.haveBeenCalledWith(parentItemId);
    });

    it(`should return default metadata if the item's folder cannot be found`, async () => {
      const itemId = 'itemId';

      mockItemService.getItemByPath.and.returnValue(null);
      mockItemService.getPath.and.returnValue(Paths.absolutePath('/a/b/c/item'));

      assert(await service.getMetadataForItem(itemId)).to.equal(DEFAULT_METADATA);
      assert(mockItemService.getItemByPath).to.haveBeenCalledWith(PathMatcher.with('/a/b/c'));
      assert(mockItemService.getPath).to.haveBeenCalledWith(itemId);
    });

    it(`should return default metadata if the item's path cannot be found`, async () => {
      const itemId = 'itemId';

      mockItemService.getPath.and.returnValue(null);

      assert(await service.getMetadataForItem(itemId)).to.equal(DEFAULT_METADATA);
      assert(mockItemService.getPath).to.haveBeenCalledWith(itemId);
    });
  });

  describe('getMetadataItemInFolder_', () => {
    it(`should return the first metadata item in the folder`, async () => {
      const path = Paths.absolutePath('/a/b/c');

      const folderId = 'folderId';
      const otherId = 'otherId';
      const otherFile = DriveFile.newInstance(
          otherId,
          'other',
          folderId,
          FileType.ASSET,
          'content',
          DriveSource.newInstance('otherDriveId'));
      const metadataId = 'metadataId';
      const metadataFile = DriveFile.newInstance(
          metadataId,
          'metadata',
          folderId,
          FileType.METADATA,
          'content',
          DriveSource.newInstance('metadataDriveId'));
      Fakes.build(mockItemService.getItem)
          .when(otherId).return(otherFile)
          .when(metadataId).return(metadataFile);

      const folder = DriveFolder.newInstance(
          folderId,
          'folder',
          null,
          ImmutableSet.of([otherId, metadataId]),
          DriveSource.newInstance('folderDriveId'));
      mockItemService.getItemByPath.and.returnValue(folder);

      assert(await service['getMetadataItemInFolder_'](path)).to.equal(metadataFile);
      assert(mockItemService.getItemByPath).to.haveBeenCalledWith(path);
    });

    it(`should return null if there are no metadata items in the folder`, async () => {
      const path = Paths.absolutePath('/a/b/c');

      const folderId = 'folderId';
      const otherId = 'otherId';
      const otherFile = DriveFile.newInstance(
          otherId,
          'other',
          folderId,
          FileType.ASSET,
          'content',
          DriveSource.newInstance('otherDriveId'));
      mockItemService.getItem.and.returnValue(otherFile);

      const folder = DriveFolder.newInstance(
          folderId,
          'folder',
          null,
          ImmutableSet.of([otherId]),
          DriveSource.newInstance('folderDriveId'));
      mockItemService.getItemByPath.and.returnValue(folder);

      assert(await service['getMetadataItemInFolder_'](path)).to.beNull();
      assert(mockItemService.getItemByPath).to.haveBeenCalledWith(path);
    });

    it(`should return null if the path does not point to a folder`, async () => {
      const path = Paths.absolutePath('/a/b/c');
      const otherFile = DriveFile.newInstance(
          'otherId',
          'other',
          'folderId',
          FileType.ASSET,
          'content',
          DriveSource.newInstance('otherDriveId'));
      mockItemService.getItemByPath.and.returnValue(otherFile);

      assert(await service['getMetadataItemInFolder_'](path)).to.beNull();
      assert(mockItemService.getItemByPath).to.haveBeenCalledWith(path);
    });
  });

  describe('resolveMetadataItem_', () => {
    it(`should concatenate the content with the ancestors`, async () => {
      const content1 = 'content1';
      const content2 = 'content2';
      const content3 = 'content3';

      const item1Id = 'item1Id';
      const item1 = DriveFile.newInstance(
          item1Id,
          'item1',
          'parentId',
          FileType.METADATA,
          content1,
          DriveSource.newInstance('driveId'));
      const item2Id = 'item2Id';
      const item2 = DriveFile.newInstance(
          item2Id,
          'item2',
          'parentId',
          FileType.METADATA,
          content2,
          DriveSource.newInstance('driveId'));
      const item3Id = 'item3Id';
      const item3 = DriveFile.newInstance(
          item3Id,
          'item3',
          'parentId',
          FileType.METADATA,
          content3,
          DriveSource.newInstance('driveId'));

      const pathString = '/a/b/c/d';
      mockItemService.getPath.and.returnValue(Paths.absolutePath(pathString));

      const metadata = Mocks.object('metadata');
      spyOn(service, 'createMetadata_').and.returnValue(Promise.resolve(metadata));

      Fakes.build(spyOn(service, 'getMetadataItemInFolder_'))
          .when(PathMatcher.with('/a/b/c/d')).return(item3)
          .when(PathMatcher.with('/a/b')).return(item2)
          .when(PathMatcher.with('/a')).return(item1)
          .else().return(null);

      assert(await service['resolveMetadataItem_'](item3)).to.equal(metadata);
      assert(service['createMetadata_']).to.haveBeenCalledWith(
          [content1, content2, content3].join('\n'),
          pathString);
      assert(mockItemService.getPath).to.haveBeenCalledWith(item3Id);
    });

    it(`should return the content of the current item if the item's path cannot be found`,
        async () => {
      const content = 'content';
      const itemId = 'itemId';
      const item = DriveFile.newInstance(
          itemId,
          'item',
          'parentId',
          FileType.METADATA,
          content,
          DriveSource.newInstance('driveId'));

      mockItemService.getPath.and.returnValue(null);

      const metadata = Mocks.object('metadata');
      spyOn(service, 'createMetadata_').and.returnValue(Promise.resolve(metadata));

      assert(await service['resolveMetadataItem_'](item)).to.equal(metadata);
      assert(service['createMetadata_']).to.haveBeenCalledWith(content, '');
      assert(mockItemService.getPath).to.haveBeenCalledWith(itemId);
    });
  });
});
