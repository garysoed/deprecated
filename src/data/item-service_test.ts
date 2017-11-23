import { assert, TestBase } from '../test-base';
TestBase.setup();

import { FakeDataGraph } from 'external/gs_tools/src/datamodel';
import { Graph } from 'external/gs_tools/src/graph';

import { $items } from '../data';
import { ItemServiceClass } from '../data/item-service';


describe('data.ItemServiceClass', () => {
  let service: ItemServiceClass;

  beforeEach(() => {
    service = new ItemServiceClass();
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
