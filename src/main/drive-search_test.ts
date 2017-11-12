import { assert, Fakes, Mocks, TestBase, TestDispose } from '../test-base';
TestBase.setup();

import { FakeDataGraph } from 'external/gs_tools/src/datamodel';
import { FLAGS as GraphFlags, Graph } from 'external/gs_tools/src/graph';
import { ImmutableList, ImmutableSet } from 'external/gs_tools/src/immutable';
import { Persona } from 'external/gs_tools/src/persona';

import { DriveService, ItemService } from '../data';
import { DriveFolder } from '../data/drive-folder';
import { $items } from '../data/item-graph';
import { ItemImpl } from '../data/item-impl';
import { ThothFolder } from '../data/thoth-folder';
import { ApiDriveType } from '../import/drive';
import { DriveStorage } from '../import/drive-storage';
import {
  $,
  $driveItems,
  driveItemsGetter,
  driveItemsSetter,
  DriveSearch } from '../main/drive-search';
import { $selectedFolder } from '../main/selected-folder-graph';

describe('driveItemsGetter', () => {
  it(`should return the correct item`, () => {
    const id = 'id';
    const name = 'name';
    const type = 'markdown';
    const itemEl = document.createElement('div');
    itemEl.setAttribute('itemid', id);
    itemEl.setAttribute('text', name);
    itemEl.setAttribute('type', type);
    itemEl.setAttribute('selected', 'true');

    const element = document.createElement('div');
    element.appendChild(itemEl);

    assert(driveItemsGetter(element)).to.equal({
      selected: true,
      summary: {id, name, type: ApiDriveType.MARKDOWN},
    });
  });

  it(`should throw error if type is not found`, () => {
    const name = 'name';
    const itemEl = document.createElement('div');
    itemEl.setAttribute('id', 'id');
    itemEl.setAttribute('text', name);

    const element = document.createElement('div');
    element.appendChild(itemEl);

    assert(() => {
      driveItemsGetter(element);
    }).to.throwError(/should exist/);
  });

  it(`should throw error if id is not found`, () => {
    const name = 'name';
    const itemEl = document.createElement('div');
    itemEl.setAttribute('text', name);
    itemEl.setAttribute('type', 'markdown');

    const element = document.createElement('div');
    element.appendChild(itemEl);

    assert(() => {
      driveItemsGetter(element);
    }).to.throwError(/should exist/);
  });

  it(`should throw error if name is not found`, () => {
    const id = 'id';
    const itemEl = document.createElement('div');
    itemEl.setAttribute('id', id);
    itemEl.setAttribute('type', 'markdown');

    const element = document.createElement('div');
    element.appendChild(itemEl);

    assert(() => {
      driveItemsGetter(element);
    }).to.throwError(/should exist/);
  });
});

describe('driveItemsSetter', () => {
  it(`should set the correct attributes`, () => {
    const id = 'id';
    const name = 'name';
    const itemEl = document.createElement('div');
    itemEl.setAttribute('id', id);
    itemEl.setAttribute('text', name);

    const element = document.createElement('div');
    element.appendChild(itemEl);

    driveItemsSetter({selected: false, summary: {id, name, type: ApiDriveType.MARKDOWN}}, element);
    assert(itemEl.getAttribute('itemid')).to.equal(id);
    assert(itemEl.getAttribute('text')).to.equal(name);
    assert(itemEl.getAttribute('type')).to.equal('markdown');
  });
});

describe('main.DriveSearch', () => {
  let search: DriveSearch;

  beforeEach(() => {
    GraphFlags.checkValueType = false;
    search = new DriveSearch(Mocks.object('ThemeService'));
    TestDispose.add(search);
  });

  describe('onInputChange_', () => {
    it(`should update the provider correctly`, async () => {
      const query = 'query';
      spyOn(Persona, 'getValue').and.returnValue(query);

      const item1 = {id: 'id1', name: 'name1', type: ApiDriveType.MARKDOWN};
      const item2 = {id: 'id2', name: 'name2', type: ApiDriveType.FOLDER};
      spyOn(DriveStorage, 'search').and
          .returnValue(Promise.resolve(ImmutableSet.of([item1, item2])));

      await search.onInputChange_();
      const items = await Graph.get($driveItems, Graph.getTimestamp(), search);
      assert([...items]).to.equal([item1, item2]);
      assert(DriveStorage.search).to.haveBeenCalledWith(query);
      assert(Persona.getValue).to.haveBeenCalledWith($.input.value, search);
    });
  });

  describe('onOkButtonAction_', () => {
    it(`should save the new folders and files correctly`, async () => {
      Graph.clearNodesForTests([$items, $selectedFolder]);

      const itemsDataGraph = new FakeDataGraph<ItemImpl>();
      Graph.createProvider($items, itemsDataGraph);

      const idSelected = 'idSelected';
      Graph.createProvider(
          $selectedFolder,
          ThothFolder.newInstance(idSelected, 'test', null, ImmutableSet.of([])));

      const id1 = 'id1';
      const name1 = 'name1';
      const mockItem1 = jasmine.createSpyObj('Item1', ['getId']);
      mockItem1.getId.and.returnValue(id1);
      const id11 = 'id11';
      const mockItem11 = jasmine.createSpyObj('Item11', ['getId']);
      mockItem11.getId.and.returnValue(id11);
      const id12 = 'id12';
      const mockItem12 = jasmine.createSpyObj('Item12', ['getId']);
      mockItem12.getId.and.returnValue(id12);
      const id2 = 'id2';
      const name2 = 'name2';
      const mockItem2 = jasmine.createSpyObj('Item2', ['getId']);
      mockItem2.getId.and.returnValue(id2);

      const idUnadded = 'idUnadded';
      const mockDispatcher = jasmine.createSpy('Dispatcher');

      Fakes.build(spyOn(Persona, 'getValue'))
          .when($.results.children, search).return(ImmutableList.of([
            {selected: true, summary: {id: id1, name: name1}},
            {selected: true, summary: {id: id2, name: name2}},
            {selected: false, summary: {id: idUnadded}},
          ]))
          .when($.host.dispatcher, search).return(mockDispatcher);


      Fakes.build(spyOn(DriveService, 'recursiveGet'))
          .when(id1).resolve(ImmutableList.of([mockItem1, mockItem11, mockItem12]))
          .when(id2).resolve(ImmutableList.of([mockItem2]));

      const saveSpy = spyOn(ItemService, 'save');
      const time = Graph.getTimestamp();

      await search.onOkButtonAction_();
      assert(mockDispatcher).to.haveBeenCalledWith('th-item-added', {});

      const selectedFolder = saveSpy.calls.argsFor(4)[1];
      assert((selectedFolder as ThothFolder).getItems()).to.haveElements([
        `${idSelected}/${name1}`,
        `${idSelected}/${name2}`,
      ]);

      assert(ItemService.save).to.haveBeenCalledWith(time, mockItem1);
      assert(ItemService.save).to.haveBeenCalledWith(time, mockItem11);
      assert(ItemService.save).to.haveBeenCalledWith(time, mockItem12);
      assert(ItemService.save).to.haveBeenCalledWith(time, mockItem2);

      assert(DriveService.recursiveGet).to.haveBeenCalledWith(id1, idSelected);
      assert(DriveService.recursiveGet).to.haveBeenCalledWith(id2, idSelected);
    });

    it(`should reject if dispatcher cannot be found`, async () => {
      Graph.clearNodesForTests([$items, $selectedFolder]);

      const itemsDataGraph = new FakeDataGraph<ItemImpl>();
      Graph.createProvider($items, itemsDataGraph);

      const idSelected = 'idSelected';
      Graph.createProvider(
          $selectedFolder,
          ThothFolder.newInstance(idSelected, 'test', null, ImmutableSet.of([])));

      Fakes.build(spyOn(Persona, 'getValue'))
          .when($.results.children, search).return(ImmutableList.of([]))
          .when($.host.dispatcher, search).return(null);

      spyOn(DriveService, 'recursiveGet').and.returnValue(Promise.resolve(ImmutableList.of([])));

      await assert(search.onOkButtonAction_()).to.rejectWithError(/exist/);
    });

    it(`should reject if the current selected folder is not editable`, async () => {
      Graph.clearNodesForTests([$items, $selectedFolder]);

      const itemsDataGraph = new FakeDataGraph<ItemImpl>();
      Graph.createProvider($items, itemsDataGraph);

      const idSelected = 'idSelected';
      Graph.createProvider(
          $selectedFolder,
          DriveFolder.newInstance(idSelected, 'test', null, ImmutableSet.of([])));

      const id1 = 'id1';
      const id2 = 'id2';
      const idUnadded = 'idUnadded';
      spyOn(Persona, 'getValue').and.returnValue(ImmutableList.of([
        {selected: true, summary: {id: id1}},
        {selected: true, summary: {id: id2}},
        {selected: false, summary: {id: idUnadded}},
      ]));

      const data1 = Mocks.object('data1');
      const data2 = Mocks.object('data2');
      Fakes.build(spyOn(DriveStorage, 'read'))
          .when(id1).resolve(data1)
          .when(id2).resolve(data2);

      spyOn(DriveService, 'recursiveGet').and.returnValue(Promise.resolve(ImmutableList.of([])));

      await assert(search.onOkButtonAction_()).to.rejectWithError(/selectedFolder/);
    });

    it(`should do nothing if there are no items selected`, async () => {
      Graph.clearNodesForTests([$items, $selectedFolder]);

      Graph.createProvider($items, new FakeDataGraph<ItemImpl>());
      Graph.createProvider(
          $selectedFolder,
          ThothFolder.newInstance('idSelected', 'test', null, ImmutableSet.of([])));

      spyOn(Persona, 'getValue').and.returnValue(null);
      spyOn(DriveStorage, 'read');
      spyOn(DriveService, 'recursiveGet').and.returnValue(Promise.resolve(ImmutableList.of([])));

      await search.onOkButtonAction_();
      assert(DriveService.recursiveGet).toNot.haveBeenCalled();
      assert(DriveStorage.read).toNot.haveBeenCalled();
      assert(Persona.getValue).to.haveBeenCalledWith($.results.children, search);
    });
  });

  describe('renderDriveItems_', () => {
    it(`should return the correct list`, () => {
      const item1 = Mocks.object('item1');
      const item2 = Mocks.object('item2');
      const items = [item1, item2];
      assert(search.renderDriveItems_(items)).to.haveElements([
        {selected: null, summary: item1},
        {selected: null, summary: item2},
      ]);
    });
  });
});
