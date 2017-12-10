import { assert, TestBase } from '../test-base';
TestBase.setup();

import { FakeDataGraph } from 'external/gs_tools/src/datamodel';
import { ImmutableSet } from 'external/gs_tools/src/immutable';

import {
  DriveFile,
  FileType,
  Item,
  PreviewFile,
  ThothFolder } from '../data';
import { ItemService } from '../data/item-service';
import { ROOT_PATH } from '../data/selected-item-graph';


describe('data.ItemService', () => {
  let itemsGraph: FakeDataGraph<Item>;
  let mockProjectService: any;
  let previewGraph: FakeDataGraph<PreviewFile>;
  let service: ItemService;

  beforeEach(() => {
    itemsGraph = new FakeDataGraph<Item>();
    mockProjectService = jasmine.createSpyObj('ProjectService', ['get']);
    previewGraph = new FakeDataGraph<PreviewFile>();
    service = new ItemService(itemsGraph, mockProjectService);
  });

  describe('getItem', () => {
    it(`should return the correct item`, async () => {
      const id = 'id';
      const item = ThothFolder.newInstance(id, 'test', null, ImmutableSet.of([]));
      itemsGraph.set(id, item);

      assert(await service.getItem(id)).to.equal(item);
    });
  });

  describe('getItemByPath', () => {
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

      const path = [ROOT_PATH, name1, name2].join('/');
      assert(await service.getItemByPath(path)).to.equal(item2);
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

      const path = [name1, name2].join('/');
      assert(await service.getItemByPath(path, rootFolder)).to.equal(item2);
      assert(service.getRootFolder).toNot.haveBeenCalled();
    });

    it(`should reject if an item in the path is not a folder`, async () => {
      const id1 = 'id1';
      const idRoot = 'idRoot';

      const rootFolder = ThothFolder.newInstance(idRoot, 'root', null, ImmutableSet.of([id1]));
      spyOn(service, 'getRootFolder').and.returnValue(Promise.resolve(rootFolder));

      const name1 = 'name1';
      const item1 = DriveFile.newInstance(id1, name1, idRoot, FileType.ASSET, 'content', 'driveId');

      itemsGraph.set(idRoot, rootFolder);
      itemsGraph.set(item1.getId(), item1);

      const path = [name1, 'name2'].join('/');
      assert(service.getItemByPath(path, rootFolder)).to.rejectWithError(/a \[Folder\]/);
      assert(service.getRootFolder).toNot.haveBeenCalled();
    });

    it(`should return null if the rootFolder was not given but the path is not root`, async () => {
      const path = ['name1', 'name2'].join('/');
      assert(await service.getItemByPath(path)).to.beNull();
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
      const item3 = DriveFile.newInstance(id3, name3, id2, FileType.ASSET, 'content', 'driveId');
      itemsGraph.set(id1, item1);
      itemsGraph.set(id2, item2);
      itemsGraph.set(id3, item3);

      assert(await service.getPath(id3)).to.equal(['', name1, name2, name3].join('/'));
    });

    it(`should resolve with null if one of the items cannot be found`, async () => {
      const id1 = 'id1';
      const id2 = 'id2';

      const item1 = ThothFolder.newInstance(id1, 'name1', 'not exist', ImmutableSet.of([id2]));
      const item2 = DriveFile.newInstance(id2, 'name2', id1, FileType.ASSET, 'content', 'driveId');
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
