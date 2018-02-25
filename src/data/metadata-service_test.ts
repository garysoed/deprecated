import { assert, Fakes, Mocks, PathMatcher, TestBase } from '../test-base';
TestBase.setup();

import { ImmutableSet } from 'external/gs_tools/src/immutable';
import { Paths } from 'external/gs_tools/src/path';

import { DriveFolder, MarkdownFile, MetadataFile, MetadataService } from '../data';
import { DEFAULT_CONFIG, DEFAULT_METADATA_FILENAME } from '../data/metadata-service';
import { DriveSource, ThothSource } from '../datasource';


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
      const variables = {a: '1', b: '2'};
      const template = '/template';
      mockJsYaml.load.and.returnValue({
        template,
        variables,
      });

      const metadata = service['createMetadata_'](unparsedContent, path);
      assert(metadata.getVariables()).to.haveElements([['a', '1'], ['b', '2']]);
      assert(metadata.getTemplate()).to.equal(PathMatcher.with(template));
      assert(jsyaml.load).to.haveBeenCalledWith(unparsedContent);
    });

    it(`should set the template to null if there are no templates objects`, () => {
      const unparsedContent = 'unparsedContent';
      const path = 'path';
      const variables = {a: '1', b: '2'};
      mockJsYaml.load.and.returnValue({
        variables,
      });

      const metadata = service['createMetadata_'](unparsedContent, path);
      assert(metadata.getVariables()).to.haveElements([['a', '1'], ['b', '2']]);
      assert(metadata.getTemplate()).to.beNull();
      assert(jsyaml.load).to.haveBeenCalledWith(unparsedContent);
    });

    it(`should throw error if the content is not the correct type`, () => {
      const unparsedContent = 'unparsedContent';
      const path = 'path';
      mockJsYaml.load.and.returnValue({
        variables: 1,
      });

      assert(() => {
        service['createMetadata_'](unparsedContent, path);
      }).to.throwError(new RegExp(path));
    });
  });

  describe('getMetadataForItem', () => {
    it(`should return the resolved metadata if one exists in the corrent folder`, async () => {
      const itemId = 'itemId';
      const content1 = 'content1';
      const metadataFile1 = MetadataFile.newInstance(
          'metadata1Id',
          'metadata1Name',
          'parentId',
          content1,
          ThothSource.newInstance());
      const content2 = 'content2';
      const metadataFile2 = MetadataFile.newInstance(
          'metadata2Id',
          'metadata2Name',
          'parentId',
          content2,
          ThothSource.newInstance());
      const content3 = 'content3';
      const metadataFile3 = MetadataFile.newInstance(
          'metadata3Id',
          'metadata3Name',
          'parentId',
          content3,
          ThothSource.newInstance());
      const content4 = 'content4';
      const metadataFile4 = MetadataFile.newInstance(
          'metadata4Id',
          'metadata4Name',
          'parentId',
          content4,
          ThothSource.newInstance());

      const itemName = 'item';
      const itemPath = `/a/b/c/${itemName}.md`;
      mockItemService.getPath.and.returnValue(Promise.resolve(Paths.absolutePath(itemPath)));

      const item = MarkdownFile.newInstance(
          itemId,
          `${itemName}.md`,
          'parentId',
          'itemContent',
          ThothSource.newInstance());
      mockItemService.getItem.and.returnValue(Promise.resolve(item));
      const folder = DriveFolder.newInstance(
          'folderId',
          'folderName',
          'folderParentId',
          ImmutableSet.of([itemId]),
          DriveSource.newInstance('driveId'));
      mockItemService.getItemByPath.and.returnValue(Promise.resolve(folder));

      Fakes.build(spyOn(service, 'getMetadataItemWithNameInFolder_'))
          .when(`${itemName}.yml`, PathMatcher.with('/a/b/c')).resolve(metadataFile1)
          .when(DEFAULT_METADATA_FILENAME, PathMatcher.with('/a/b/c')).resolve(metadataFile2)
          .when(DEFAULT_METADATA_FILENAME, PathMatcher.with('/a/b')).resolve(metadataFile3)
          .when(DEFAULT_METADATA_FILENAME, PathMatcher.with('/a')).resolve(metadataFile4);

      const renderConfig = Mocks.object('renderConfig');
      spyOn(service, 'createMetadata_').and.returnValue(renderConfig);

      assert(await service.getMetadataForItem(itemId)).to.equal(renderConfig);
      const expectedContents = [content4, content3, content2, content1].join('\n');
      assert(service['createMetadata_']).to.haveBeenCalledWith(expectedContents, itemPath);
      assert(mockItemService.getItemByPath).to.haveBeenCalledWith(PathMatcher.with('/a/b/c'));
      assert(mockItemService.getItem).to.haveBeenCalledWith(itemId);
      assert(mockItemService.getPath).to.haveBeenCalledWith(itemId);
    });

    it(`should return the default config if the item is not in any directories`, async () => {
      const itemId = 'itemId';
      const itemName = 'item';
      const itemPath = `/a/b/c/${itemName}.md`;
      mockItemService.getPath.and.returnValue(Promise.resolve(Paths.absolutePath(itemPath)));

      const item = MarkdownFile.newInstance(
          itemId,
          `${itemName}.md`,
          'parentId',
          'itemContent',
          ThothSource.newInstance());
      mockItemService.getItem.and.returnValue(Promise.resolve(item));
      mockItemService.getItemByPath.and.returnValue(Promise.resolve(null));

      spyOn(service, 'createMetadata_');

      assert(await service.getMetadataForItem(itemId)).to.equal(DEFAULT_CONFIG);
      assert(service['createMetadata_']).toNot.haveBeenCalled();
      assert(mockItemService.getItemByPath).to.haveBeenCalledWith(PathMatcher.with('/a/b/c'));
      assert(mockItemService.getItem).to.haveBeenCalledWith(itemId);
      assert(mockItemService.getPath).to.haveBeenCalledWith(itemId);
    });

    it(`should return the default config if the item's path cannot be found`, async () => {
      const itemId = 'itemId';
      const itemName = 'item';
      mockItemService.getPath.and.returnValue(Promise.resolve(null));

      const item = MarkdownFile.newInstance(
          itemId,
          `${itemName}.md`,
          'parentId',
          'itemContent',
          ThothSource.newInstance());
      mockItemService.getItem.and.returnValue(Promise.resolve(item));

      spyOn(service, 'createMetadata_');

      assert(await service.getMetadataForItem(itemId)).to.equal(DEFAULT_CONFIG);
      assert(service['createMetadata_']).toNot.haveBeenCalled();
      assert(mockItemService.getItem).to.haveBeenCalledWith(itemId);
      assert(mockItemService.getPath).to.haveBeenCalledWith(itemId);
    });

    it(`should return the default config if the item cannot be found`, async () => {
      const itemId = 'itemId';
      const itemName = 'item';
      const itemPath = `/a/b/c/${itemName}.md`;
      mockItemService.getPath.and.returnValue(Promise.resolve(Paths.absolutePath(itemPath)));
      mockItemService.getItem.and.returnValue(Promise.resolve(null));

      spyOn(service, 'createMetadata_');

      assert(await service.getMetadataForItem(itemId)).to.equal(DEFAULT_CONFIG);
      assert(service['createMetadata_']).toNot.haveBeenCalled();
      assert(mockItemService.getItem).to.haveBeenCalledWith(itemId);
      assert(mockItemService.getPath).to.haveBeenCalledWith(itemId);
    });
  });

  describe('getMetadataItemWithNameInFolder_', () => {
    it(`should return the first matching metadata item in the folder`, async () => {
      const path = Paths.absolutePath('/a/b/c');

      const folderId = 'folderId';
      const otherId = 'otherId';
      const otherFile = MarkdownFile.newInstance(
          otherId,
          'other',
          folderId,
          'content',
          DriveSource.newInstance('otherDriveId'));
      const metadataId = 'metadataId';
      const metadataName = 'metadataName';
      const metadataFile = MetadataFile.newInstance(
          metadataId,
          metadataName,
          folderId,
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

      assert(await service['getMetadataItemWithNameInFolder_'](metadataName, path))
          .to.equal(metadataFile);
      assert(mockItemService.getItemByPath).to.haveBeenCalledWith(path);
    });

    it(`should return null if there are no matching metadata items in the folder`, async () => {
      const path = Paths.absolutePath('/a/b/c');

      const folderId = 'folderId';
      const otherId = 'otherId';
      const otherFile = MetadataFile.newInstance(
          otherId,
          'other',
          folderId,
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

      assert(await service['getMetadataItemWithNameInFolder_']('metadata', path)).to.beNull();
      assert(mockItemService.getItemByPath).to.haveBeenCalledWith(path);
    });

    it(`should return null if there are no metadata items in the folder`, async () => {
      const path = Paths.absolutePath('/a/b/c');

      const folderId = 'folderId';
      const otherId = 'otherId';
      const fileName = 'fileName';
      const otherFile = MarkdownFile.newInstance(
          otherId,
          fileName,
          folderId,
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

      assert(await service['getMetadataItemWithNameInFolder_'](fileName, path)).to.beNull();
      assert(mockItemService.getItemByPath).to.haveBeenCalledWith(path);
    });

    it(`should return null if the path does not point to a folder`, async () => {
      const path = Paths.absolutePath('/a/b/c');
      const otherFile = MarkdownFile.newInstance(
          'otherId',
          'other',
          'folderId',
          'content',
          DriveSource.newInstance('otherDriveId'));
      mockItemService.getItemByPath.and.returnValue(otherFile);

      assert(await service['getMetadataItemWithNameInFolder_']('metadata', path)).to.beNull();
      assert(mockItemService.getItemByPath).to.haveBeenCalledWith(path);
    });
  });
});
