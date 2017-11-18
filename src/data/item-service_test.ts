import { assert, TestBase } from '../test-base';
TestBase.setup();

import { FakeDataGraph } from 'external/gs_tools/src/datamodel';
import { FLAGS as GraphFlags, Graph } from 'external/gs_tools/src/graph';
import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { ItemType } from '../data';
import { DriveFile } from '../data/drive-file';
import { DriveFolder } from '../data/drive-folder';
import { $items } from '../data/item-graph';
import { ItemImpl } from '../data/item-impl';
import { ItemServiceClass } from '../data/item-service';
import { ThothFolder } from '../data/thoth-folder';


describe('data.ItemServiceClass', () => {
  let service: ItemServiceClass;

  beforeEach(() => {
    service = new ItemServiceClass();
  });

  describe('findFirstEditableAncestorPath', () => {
    beforeEach(() => {
      GraphFlags.checkValueType = false;
    });

    afterEach(() => {
      GraphFlags.checkValueType = true;
    });

    it(`should resolve with the correct path`, async () => {
      const id1 = 'id1';
      const id2 = 'id2';
      const id3 = 'id3';
      const id4 = 'id4';

      const item1 = ThothFolder.newInstance(id1, 'name1', null, ImmutableSet.of([id2]));
      const item2 = ThothFolder.newInstance(id2, 'name2', id1, ImmutableSet.of([id3]));
      const item3 = DriveFolder.newInstance(id3, 'name3', id2, ImmutableSet.of([id4]), 'driveId');
      const item4 = DriveFile.newInstance(id4, 'name4', id3, ItemType.ASSET, 'content4', 'driveId');

      const itemsGraph = new FakeDataGraph<ItemImpl>();
      itemsGraph.set(id1, item1);
      itemsGraph.set(id2, item2);
      itemsGraph.set(id3, item3);
      itemsGraph.set(id4, item4);

      Graph.clearNodesForTests([$items]);
      Graph.createProvider($items, itemsGraph);

      await assert(service.findFirstEditableAncestorPath(id4, Graph.getTimestamp()))
          .to.resolveWith([id2, id3, id4]);
    });

    it(`should resolve with null if none of the ancestors are editable`, async () => {
      const id1 = 'id1';
      const id2 = 'id2';

      const item1 = DriveFolder.newInstance(id1, 'name1', null, ImmutableSet.of([id2]), 'driveId');
      const item2 = DriveFile.newInstance(id2, 'name2', id1, ItemType.ASSET, 'content2', 'driveId');

      const itemsGraph = new FakeDataGraph<ItemImpl>();
      itemsGraph.set(id1, item1);
      itemsGraph.set(id2, item2);

      Graph.clearNodesForTests([$items]);
      Graph.createProvider($items, itemsGraph);

      await assert(service.findFirstEditableAncestorPath(id2, Graph.getTimestamp()))
          .to.resolveWith(null);
    });

    it(`should resolve with null if the root node is given`, async () => {
      const id = 'id';
      const item = ThothFolder.newInstance(id, 'name', null, ImmutableSet.of([]));

      const itemsGraph = new FakeDataGraph<ItemImpl>();
      itemsGraph.set(id, item);

      Graph.clearNodesForTests([$items]);
      Graph.createProvider($items, itemsGraph);

      await assert(service.findFirstEditableAncestorPath(id, Graph.getTimestamp()))
          .to.resolveWith(null);
    });

    it(`should resolve with null if the item cannot be found`, async () => {
      const id = 'id';
      const itemsGraph = new FakeDataGraph<ItemImpl>();

      Graph.clearNodesForTests([$items]);
      Graph.createProvider($items, itemsGraph);

      await assert(service.findFirstEditableAncestorPath(id, Graph.getTimestamp()))
          .to.resolveWith(null);
    });
  });

  describe('getNameFromId', () => {
    it(`should return the correct name`, () => {
      assert(service.getNameFromId('/a/b/c')).to.equal('c');
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
