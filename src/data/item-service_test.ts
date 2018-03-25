import { assert, Fakes, Matchers, Mocks, TestBase } from '../test-base';
TestBase.setup();

import { FakeDataGraph } from 'external/gs_tools/src/datamodel';
import { ImmutableMap, ImmutableSet, TreeMap } from 'external/gs_tools/src/immutable';

import { DriveFolder, Folder, Item, MetadataFile, ThothFolder, UnknownFile } from '../data';
import { ItemService } from '../data/item-service';
import { ApiDriveFile, ApiDriveType, DriveSource, ThothSource } from '../datasource';
import { MarkdownFile } from './markdown-file';

function folderToJson(folder: Folder): {} {
  return {
    id: folder.getId(),
    itemIds: [...folder.getItems()],
  };
}

describe('data.ItemService', () => {
  let itemsGraph: FakeDataGraph<Item>;
  let mockProjectService: any;
  let service: ItemService;

  beforeEach(() => {
    itemsGraph = new FakeDataGraph<Item>();
    mockProjectService = jasmine.createSpyObj('ProjectService', ['get']);
    service = new ItemService(itemsGraph, mockProjectService);
  });

  describe('createItem_', () => {
    it(`should create the correct item for markdown files`, () => {
      const filename = 'filename';
      const content = 'content';
      const itemId = 'itemId';
      const containerId = 'containerId';
      const driveId = 'driveId';
      const source = DriveSource.newInstance(driveId);
      const driveItem = {
        content,
        files: [],
        summary: {
          name: filename,
          source,
          type: ApiDriveType.MARKDOWN,
        },
      };

      const item = service['createItem_'](
          containerId, driveItem, ImmutableMap.of([[driveId, itemId]]));
      assert(item).to.beAnInstanceOf(MarkdownFile);
      assert(item.getId()).to.equal(itemId);
      assert(item.getName()).to.equal(filename);
      assert(item.getParentId()).to.equal(containerId);
      assert((item as MarkdownFile).getContent()).to.equal(content);
      assert(item.getSource()).to.equal(source);
    });

    it(`should create the correct item for metadata files`, () => {
      const filename = 'filename';
      const content = 'content';
      const itemId = 'itemId';
      const containerId = 'containerId';
      const driveId = 'driveId';
      const source = DriveSource.newInstance(driveId);
      const driveItem = {
        content,
        files: [],
        summary: {
          name: filename,
          source,
          type: ApiDriveType.YAML,
        },
      };

      const item = service['createItem_'](
          containerId, driveItem, ImmutableMap.of([[driveId, itemId]]));
      assert(item).to.beAnInstanceOf(MetadataFile);
      assert(item.getId()).to.equal(itemId);
      assert(item.getName()).to.equal(filename);
      assert(item.getParentId()).to.equal(containerId);
      assert((item as MetadataFile).getContent()).to.equal(content);
      assert(item.getSource()).to.equal(source);
    });

    it(`should create the correct item for drive folders`, () => {
      const filename = 'filename';
      const content = 'content';
      const itemId = 'itemId';
      const containerId = 'containerId';
      const driveId = 'driveId';
      const source = DriveSource.newInstance(driveId);
      const childDriveId1 = 'childDriveId1';
      const childDriveId2 = 'childDriveId2';
      const driveItem = {
        content,
        files: [
          {summary: {source: DriveSource.newInstance(childDriveId1)}} as ApiDriveFile,
          {summary: {source: DriveSource.newInstance(childDriveId2)}} as ApiDriveFile,
        ],
        summary: {
          name: filename,
          source,
          type: ApiDriveType.FOLDER,
        },
      };

      const childId1 = 'childId1';
      const childId2 = 'childId2';
      const driveIdMap = ImmutableMap.of([
        [driveId, itemId],
        [childDriveId1, childId1],
        [childDriveId2, childId2],
      ]);
      const item = service['createItem_'](containerId, driveItem, driveIdMap);
      assert(item).to.beAnInstanceOf(DriveFolder);
      assert(item.getId()).to.equal(itemId);
      assert(item.getName()).to.equal(filename);
      assert(item.getParentId()).to.equal(containerId);
      assert((item as DriveFolder).getItems()).to.haveElements([childId1, childId2]);
      assert(item.getSource()).to.equal(source);
    });

    it(`should throw error if an item ID in the drive folder does not exist`, () => {
      const filename = 'filename';
      const content = 'content';
      const itemId = 'itemId';
      const containerId = 'containerId';
      const driveId = 'driveId';
      const source = DriveSource.newInstance(driveId);
      const childDriveId1 = 'childDriveId1';
      const childDriveId2 = 'childDriveId2';
      const driveItem = {
        content,
        files: [
          {summary: {source: DriveSource.newInstance(childDriveId1)}} as ApiDriveFile,
          {summary: {source: DriveSource.newInstance(childDriveId2)}} as ApiDriveFile,
        ],
        summary: {
          name: filename,
          source,
          type: ApiDriveType.FOLDER,
        },
      };

      const childId = 'childId';
      const driveIdMap = ImmutableMap.of([
        [driveId, itemId],
        [childDriveId1, childId],
      ]);
      assert(() => {
        service['createItem_'](containerId, driveItem, driveIdMap);
      }).to.throwError(/should exist/);
    });

    it(`should throw error if item ID for the drive ID does not exist`, () => {
      const content = 'content';
      const source = DriveSource.newInstance('driveId');
      const driveItem = {
        content,
        files: [],
        summary: {
          name: 'filename',
          source,
          type: ApiDriveType.MARKDOWN,
        },
      };

      assert(() => {
        service['createItem_']('containerId', driveItem, ImmutableMap.of([]));
      }).to.throwError(/should exist/);
    });

    it(`should create the correct item for unknown files`, () => {
      const filename = 'filename';
      const itemId = 'itemId';
      const containerId = 'containerId';
      const driveId = 'driveId';
      const source = DriveSource.newInstance(driveId);
      const driveItem = {
        content: 'content',
        files: [],
        summary: {
          name: filename,
          source,
          type: ApiDriveType.UNKNOWN,
        },
      };

      const item = service['createItem_'](
          containerId, driveItem, ImmutableMap.of([[driveId, itemId]]));
      assert(item).to.beAnInstanceOf(UnknownFile);
      assert(item.getId()).to.equal(itemId);
      assert(item.getName()).to.equal(filename);
      assert(item.getParentId()).to.equal(containerId);
      assert(item.getSource()).to.equal(source);
    });
  });

  describe('deleteItem', () => {
    it(`should delete the item correctly`, async () => {
      const child1Id = 'child1Id';
      const parentId = 'parentId';
      const itemId = 'itemId';

      const item = MetadataFile.newInstance(
          itemId,
          'itemName',
          parentId,
          'content',
          ThothSource.newInstance());

      const parent = ThothFolder.newInstance(
          parentId,
          'parent',
          null,
          ImmutableSet.of([itemId, child1Id]));
      await Promise.all([
        itemsGraph.set(itemId, item),
        itemsGraph.set(parentId, parent),
      ]);

      spyOn(service, 'save');

      await service.deleteItem(itemId);
      assert(service.save).to.haveBeenCalledWith(
          Matchers
              .map(folderToJson)
              .objectContaining({id: parentId, itemIds: [child1Id]}));
      assert(await itemsGraph.get(itemId)).to.beNull();
    });

    it(`should not save if parent is not a ThothFolder`, async () => {
      const child1Id = 'child1Id';
      const parentId = 'parentId';
      const itemId = 'itemId';

      const item = MetadataFile.newInstance(
          itemId,
          'itemName',
          parentId,
          'content',
          ThothSource.newInstance());

      const parent = DriveFolder.newInstance(
          parentId,
          'parent',
          null,
          ImmutableSet.of([itemId, child1Id]),
          DriveSource.newInstance('driveId'));
      await Promise.all([
        itemsGraph.set(itemId, item),
        itemsGraph.set(parentId, parent),
      ]);

      spyOn(service, 'save');

      await service.deleteItem(itemId);
      assert(service.save).toNot.haveBeenCalled();
      assert(await itemsGraph.get(itemId)).to.beNull();
    });

    it(`should not save if there are no parents`, async () => {
      const itemId = 'itemId';

      const item = ThothFolder.newInstance(
          itemId,
          'itemName',
          null,
          ImmutableSet.of([]));

      await Promise.all([
        itemsGraph.set(itemId, item),
      ]);

      spyOn(service, 'save');

      await service.deleteItem(itemId);
      assert(service.save).toNot.haveBeenCalled();
      assert(await itemsGraph.get(itemId)).to.beNull();
    });

    it(`should not throw errors if there are no items`, async () => {
      spyOn(service, 'save');

      await service.deleteItem('itemId');
      assert(service.save).toNot.haveBeenCalled();
    });
  });

  describe('getItem', () => {
    it(`should return the correct item`, async () => {
      const id = 'id';
      const item = ThothFolder.newInstance(id, 'test', null, ImmutableSet.of([]));
      itemsGraph.set(id, item);

      assert(await service.getItem(id)).to.equal(item);
    });
  });

  describe('getItemByPath_', () => {
    it(`should return the correct item`, async () => {
      const id1 = 'id1';
      const id2 = 'id2';
      const idRoot = 'idRoot';

      const rootFolder = ThothFolder.newInstance(idRoot, 'root', null, ImmutableSet.of([id1]));
      spyOn(service, 'getRootFolder').and.returnValue(Promise.resolve(rootFolder));

      const name1 = 'name1';
      const item1 = ThothFolder.newInstance(id1, name1, idRoot, ImmutableSet.of([id2]));

      const name2 = 'name2';
      const item2 = ThothFolder.newInstance(id2, name2, id1, ImmutableSet.of([]));

      itemsGraph.set(idRoot, rootFolder);
      itemsGraph.set(id1, item1);
      itemsGraph.set(id2, item2);

      assert(await service['getItemByPath_'](['(root)', name1, name2], null)).to.equal(item2);
      assert(service.getRootFolder).to.haveBeenCalledWith();
    });

    it(`should return the correct item with the root folder given`, async () => {
      const id1 = 'id1';
      const id2 = 'id2';
      const idRoot = 'idRoot';

      const rootFolder = ThothFolder.newInstance(idRoot, 'root', null, ImmutableSet.of([id1]));
      spyOn(service, 'getRootFolder').and.returnValue(Promise.resolve(rootFolder));

      const name1 = 'name1';
      const item1 = ThothFolder.newInstance(id1, name1, idRoot, ImmutableSet.of([id2]));

      const name2 = 'name2';
      const item2 = ThothFolder.newInstance(id2, name2, id1, ImmutableSet.of([]));

      itemsGraph.set(idRoot, rootFolder);
      itemsGraph.set(id1, item1);
      itemsGraph.set(id2, item2);

      assert(await service['getItemByPath_']([name1, name2], rootFolder)).to.equal(item2);
      assert(service.getRootFolder).toNot.haveBeenCalled();
    });

    it(`should reject if an item in the path is not a folder`, async () => {
      const id1 = 'id1';
      const idRoot = 'idRoot';

      const rootFolder = ThothFolder.newInstance(idRoot, 'root', null, ImmutableSet.of([id1]));
      spyOn(service, 'getRootFolder').and.returnValue(Promise.resolve(rootFolder));

      const name1 = 'name1';
      const item1 = MarkdownFile.newInstance(
          name1,
          idRoot,
          'parentId',
          'content',
          DriveSource.newInstance('driveId'));

      itemsGraph.set(idRoot, rootFolder);
      itemsGraph.set(item1.getId(), item1);

      assert(service['getItemByPath_']([name1, 'name2'], rootFolder)).to
          .rejectWithError(/a \[Folder\]/);
      assert(service.getRootFolder).toNot.haveBeenCalled();
    });

    it(`should return null if the rootFolder was not given but the path is not root`, async () => {
      assert(await service['getItemByPath_'](['name1', 'name2'], null)).to.beNull();
    });
  });

  describe('getPath', () => {
    it(`should resolve with the correct path`, async () => {
      const id1 = 'id1';
      const id2 = 'id2';
      const id3 = 'id3';

      const name1 = 'name1';
      const item1 = ThothFolder.newInstance(id1, name1, null, ImmutableSet.of([id2]));

      const name2 = 'name2';
      const item2 = ThothFolder.newInstance(id2, name2, id1, ImmutableSet.of([id3]));

      const name3 = 'name3';
      const item3 = MarkdownFile.newInstance(
          id3, name3, id2, 'content', DriveSource.newInstance('driveId'));
      itemsGraph.set(id1, item1);
      itemsGraph.set(id2, item2);
      itemsGraph.set(id3, item3);

      const path = await service.getPath(id3);
      assert(path!.toString()).to.equal(`/${name1}/${name2}/${name3}`);
    });

    it(`should resolve with null if one of the items cannot be found`, async () => {
      const id1 = 'id1';
      const id2 = 'id2';

      const item1 = ThothFolder.newInstance(id1, 'name1', 'not exist', ImmutableSet.of([id2]));
      const item2 = MarkdownFile.newInstance(
          id2, 'name2', id1, 'content', DriveSource.newInstance('driveId'));
      itemsGraph.set(id1, item1);
      itemsGraph.set(id2, item2);

      assert(await service.getPath(id2)).to.beNull();
    });
  });

  describe('getRootFolder', () => {
    it(`should create a new root folder if one does not exist`, async () => {
      const rootFolderId = 'rootFolderId';
      const mockProject = jasmine.createSpyObj('Project', ['getRootFolderId']);
      mockProject.getRootFolderId.and.returnValue(rootFolderId);

      spyOn(service, 'save');
      mockProjectService.get.and.returnValue(Promise.resolve(mockProject));

      const root = await service.getRootFolder();
      assert(service.save).to.haveBeenCalledWith(root);
      assert(root.getId()).to.equal(rootFolderId);
      assert(mockProjectService.get).to.haveBeenCalledWith();
    });

    it(`should return an existing root folder`, async () => {
      const rootFolderId = 'rootFolderId';
      const mockProject = jasmine.createSpyObj('Project', ['getRootFolderId']);
      mockProject.getRootFolderId.and.returnValue(rootFolderId);

      const rootFolder = ThothFolder.newInstance(rootFolderId, 'name', null, ImmutableSet.of([]));
      itemsGraph.set(rootFolderId, rootFolder);

      spyOn(service, 'save');
      mockProjectService.get.and.returnValue(Promise.resolve(mockProject));

      assert(await service.getRootFolder()).to.equal(rootFolder);
      assert(service.save).toNot.haveBeenCalled();
      assert(mockProjectService.get).to.haveBeenCalledWith();
    });
  });

  describe('recursiveCreate', () => {
    function createApiDriveFile(driveId: string): ApiDriveFile {
      return {
        summary: {
          source: DriveSource.newInstance(driveId),
        },
      } as ApiDriveFile;
    }

    it(`should create the items correctly`, async () => {
      const rootDriveId = 'rootDriveId';
      const child1DriveId = 'child1DriveId';
      const child2DriveId = 'child2DriveId';
      const containerId = 'containerId';

      const rootDrive = createApiDriveFile(rootDriveId);
      const child1Drive = createApiDriveFile(child1DriveId);
      const child2Drive = createApiDriveFile(child2DriveId);
      const driveTree = TreeMap.of<string, ApiDriveFile>(rootDrive)
          .set(child1DriveId, TreeMap.of(child1Drive))
          .set(child2DriveId, TreeMap.of(child2Drive));

      const rootItem = Mocks.object('rootItem');
      const child1Item = Mocks.object('child1Item');
      const child2Item = Mocks.object('child2Item');
      Fakes.build(spyOn(service, 'createItem_'))
          .when(Matchers.anyString(), rootDrive).return(rootItem)
          .when(Matchers.anyString(), child1Drive).return(child1Item)
          .when(Matchers.anyString(), child2Drive).return(child2Item);

      const rootId = 'rootId';
      const child1Id = 'child1Id';
      const child2Id = 'child2Id';
      spyOn(service, 'newId').and.returnValues(
          Promise.resolve(rootId),
          Promise.resolve(child1Id),
          Promise.resolve(child2Id));

      const tree = await service.recursiveCreate(driveTree, containerId);
      assert(tree.preOrder().map((node) => node.getValue())).to
          .haveElements([rootItem, child1Item, child2Item]);

      const expectedDriveIdMapMatcher = Matchers
          .map((map: ImmutableMap<string, string>) => [...map])
          .arrayContaining<[string, string]>([
            [rootDriveId, rootId],
            [child1DriveId, child1Id],
            [child2DriveId, child2Id],
          ]) as any;
      assert(service['createItem_']).to
          .haveBeenCalledWith(containerId, rootDrive, expectedDriveIdMapMatcher);
      assert(service['createItem_']).to
          .haveBeenCalledWith(rootId, child1Drive, expectedDriveIdMapMatcher);
      assert(service['createItem_']).to
          .haveBeenCalledWith(rootId, child2Drive, expectedDriveIdMapMatcher);
    });
  });

  describe('save', () => {
    it(`should save the items correctly`, async () => {
      const id1 = 'id1';
      const mockItem1 = jasmine.createSpyObj('Item1', ['getId']);
      mockItem1.getId.and.returnValue(id1);

      const id2 = 'id2';
      const mockItem2 = jasmine.createSpyObj('Item2', ['getId']);
      mockItem2.getId.and.returnValue(id2);

      await service.save(mockItem1, mockItem2);
      assert(await itemsGraph.get(id1)).to.equal(mockItem1);
      assert(await itemsGraph.get(id2)).to.equal(mockItem2);
    });
  });
});
