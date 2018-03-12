import { assert, Matchers, TestBase } from '../test-base';
TestBase.setup();

import { FakeDataGraph } from 'external/gs_tools/src/datamodel';
import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { DriveFolder, Folder, Item, MetadataFile, ThothFolder } from '../data';
import { ItemService } from '../data/item-service';
import { DriveSource, ThothSource } from '../datasource';
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
