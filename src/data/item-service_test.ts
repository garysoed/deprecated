import { assert, TestBase } from '../test-base';
TestBase.setup();

import { FakeDataGraph } from 'external/gs_tools/src/datamodel';
import { FLAGS as GraphFlags, Graph } from 'external/gs_tools/src/graph';
import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { $items, DriveFile, FileType, Item, ProjectService, ThothFolder } from '../data';
import { ItemServiceClass } from '../data/item-service';
import { ROOT_PATH } from '../data/selected-item-graph';


describe('data.ItemServiceClass', () => {
  let service: ItemServiceClass;

  beforeEach(() => {
    GraphFlags.checkValueType = false;
    service = new ItemServiceClass();
  });

  afterAll(() => {
    GraphFlags.checkValueType = true;
  });

  describe('getItem', () => {
    it(`should return the correct item`, async () => {
      const id = 'id';
      const item = ThothFolder.newInstance(id, 'test', null, ImmutableSet.of([]));
      const itemGraph = new FakeDataGraph<ThothFolder>();
      itemGraph.set(id, item);

      Graph.clearNodesForTests(ImmutableSet.of([$items]));
      Graph.createProvider($items, itemGraph);

      const time = Graph.getTimestamp();

      assert(await service.getItem(id, time)).to.equal(item);
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

      const itemGraph = new FakeDataGraph<ThothFolder>();
      itemGraph.set(idRoot, rootFolder);
      itemGraph.set(id1, item1);
      itemGraph.set(id2, item2);

      Graph.clearNodesForTests(ImmutableSet.of([$items]));
      Graph.createProvider($items, itemGraph);

      const time = Graph.getTimestamp();

      const path = [ROOT_PATH, name1, name2].join('/');
      assert(await service.getItemByPath(time, path)).to.equal(item2);
      assert(service.getRootFolder).to.haveBeenCalledWith(time);
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

      const itemGraph = new FakeDataGraph<ThothFolder>();
      itemGraph.set(idRoot, rootFolder);
      itemGraph.set(id1, item1);
      itemGraph.set(id2, item2);

      Graph.clearNodesForTests(ImmutableSet.of([$items]));
      Graph.createProvider($items, itemGraph);

      const time = Graph.getTimestamp();

      const path = [name1, name2].join('/');
      assert(await service.getItemByPath(time, path, rootFolder)).to.equal(item2);
      assert(service.getRootFolder).toNot.haveBeenCalled();
    });

    it(`should reject if an item in the path is not a folder`, async () => {
      const id1 = 'id1';
      const idRoot = 'idRoot';

      const rootFolder = ThothFolder.newInstance(idRoot, 'root', null, ImmutableSet.of([id1]));
      spyOn(service, 'getRootFolder').and.returnValue(Promise.resolve(rootFolder));

      const name1 = 'name1';
      const item1 = DriveFile.newInstance(id1, name1, idRoot, FileType.ASSET, 'content', 'driveId');

      const itemGraph = new FakeDataGraph<Item>();
      itemGraph.set(idRoot, rootFolder);
      itemGraph.set(id1, item1);

      Graph.clearNodesForTests(ImmutableSet.of([$items]));
      Graph.createProvider($items, itemGraph);

      const time = Graph.getTimestamp();

      const path = [name1, 'name2'].join('/');
      assert(service.getItemByPath(time, path, rootFolder)).to.rejectWithError(/a \[Folder\]/);
      assert(service.getRootFolder).toNot.haveBeenCalled();
    });

    it(`should return null if the rootFolder was not given but the path is not root`, async () => {
      const itemGraph = new FakeDataGraph<Item>();

      Graph.clearNodesForTests(ImmutableSet.of([$items]));
      Graph.createProvider($items, itemGraph);

      const time = Graph.getTimestamp();

      const path = ['name1', 'name2'].join('/');
      assert(await service.getItemByPath(time, path)).to.beNull();
    });
  });

  describe('getRootFolder', () => {
    it(`should create a new root folder if one does not exist`, async () => {
      const rootFolderId = 'rootFolderId';
      const mockProject = jasmine.createSpyObj('Project', ['getRootFolderId']);
      mockProject.getRootFolderId.and.returnValue(rootFolderId);

      const time = Graph.getTimestamp();

      const itemGraph = new FakeDataGraph<Item>();

      Graph.clearNodesForTests(ImmutableSet.of([$items]));
      Graph.createProvider($items, itemGraph);

      spyOn(service, 'save');
      spyOn(ProjectService, 'get').and.returnValue(Promise.resolve(mockProject));

      const root = await service.getRootFolder(time);
      assert(service.save).to.haveBeenCalledWith(time, root);
      assert(root.getId()).to.equal(rootFolderId);
      assert(ProjectService.get).to.haveBeenCalledWith(time);
    });

    it(`should return an existing root folder`, async () => {
      const rootFolderId = 'rootFolderId';
      const mockProject = jasmine.createSpyObj('Project', ['getRootFolderId']);
      mockProject.getRootFolderId.and.returnValue(rootFolderId);

      const time = Graph.getTimestamp();

      const rootFolder = ThothFolder.newInstance(rootFolderId, 'name', null, ImmutableSet.of([]));
      const itemGraph = new FakeDataGraph<Item>();
      itemGraph.set(rootFolderId, rootFolder);

      Graph.clearNodesForTests(ImmutableSet.of([$items]));
      Graph.createProvider($items, itemGraph);

      spyOn(service, 'save');
      spyOn(ProjectService, 'get').and.returnValue(Promise.resolve(mockProject));

      assert(await service.getRootFolder(time)).to.equal(rootFolder);
      assert(service.save).toNot.haveBeenCalled();
      assert(ProjectService.get).to.haveBeenCalledWith(time);
    });
  });

  describe('save', () => {
    it(`should save the items correctly`, async () => {
      const time = Graph.getTimestamp();

      const id1 = 'id1';
      const mockItem1 = jasmine.createSpyObj('Item1', ['getId']);
      mockItem1.getId.and.returnValue(id1);

      const id2 = 'id2';
      const mockItem2 = jasmine.createSpyObj('Item2', ['getId']);
      mockItem2.getId.and.returnValue(id2);

      const itemsGraph = new FakeDataGraph();
      spyOn(Graph, 'get').and.returnValue(Promise.resolve(itemsGraph));

      await service.save(time, mockItem1, mockItem2);
      assert(await itemsGraph.get(id1)).to.equal(mockItem1);
      assert(await itemsGraph.get(id2)).to.equal(mockItem2);

      assert(Graph.get).to.haveBeenCalledWith($items, time);
    });
  });
});
