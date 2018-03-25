import { assert, Fakes, Mocks, TestBase, TestDispose, TestGraph } from '../test-base';
TestBase.setup();

import { FLAGS as GraphFlags, Graph } from 'external/gs_tools/src/graph';
import { ImmutableList, ImmutableSet, TreeMap } from 'external/gs_tools/src/immutable';
import { Persona } from 'external/gs_tools/src/persona';

import {
  $driveService,
  $itemService,
  $selectedItem,
  DriveFolder,
  Item,
  ThothFolder } from '../data';
import { ApiDriveType, DriveSource, DriveStorage } from '../datasource';
import {
  $,
  $driveItems,
  driveItemsGetter,
  driveItemsSetter,
  DriveSearch } from '../main/drive-search';

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

      const id1 = 'id1';
      const id2 = 'id2';
      const name1 = 'name1';
      const name2 = 'name2';

      spyOn(DriveStorage, 'search').and.returnValue(Promise.resolve(ImmutableList.of([
        {
          name: name1,
          source: DriveSource.newInstance(id1),
          type: ApiDriveType.MARKDOWN,
        },
        {
          name: name2,
          source: DriveSource.newInstance(id2),
          type: ApiDriveType.FOLDER,
        },
      ])));

      await search.onInputChange_();
      const items = await Graph.get($driveItems, Graph.getTimestamp(), search);
      assert([...items]).to.equal([
        {id: id1, name: name1, type: ApiDriveType.MARKDOWN},
        {id: id2, name: name2, type: ApiDriveType.FOLDER},
      ]);
      assert(DriveStorage.search).to.haveBeenCalledWith(query);
      assert(Persona.getValue).to.haveBeenCalledWith($.input.value, search);
    });
  });

  describe('onOkButtonAction_', () => {
    it(`should save the new folders and files correctly`, async () => {
      const idSelected = 'idSelected';
      TestGraph.set(
          $selectedItem,
          ThothFolder.newInstance(idSelected, 'test', null, ImmutableSet.of([])));

      const mockItemService = jasmine.createSpyObj('ItemService', ['recursiveCreate', 'save']);
      TestGraph.set($itemService, mockItemService);

      const id1 = 'id1';
      const name1 = 'name1';
      const mockItem1 = jasmine.createSpyObj('Item1', ['getId']);
      mockItem1.getId.and.returnValue(id1);
      const item11 = Mocks.object('item11');
      const item12 = Mocks.object('item12');
      const id2 = 'id2';
      const name2 = 'name2';
      const mockItem2 = jasmine.createSpyObj('Item2', ['getId']);
      mockItem2.getId.and.returnValue(id2);

      const idUnadded = 'idUnadded';
      const mockDispatcher = jasmine.createSpy('Dispatcher');

      const drive1Tree = Mocks.object('drive1Tree', TreeMap);
      const drive2Tree = Mocks.object('drive2Tree', TreeMap);

      const mockDriveService = jasmine.createSpyObj('DriveService', ['recursiveGet']);
      Fakes.build(mockDriveService.recursiveGet).call((source: DriveSource) => {
        const driveId = source.getDriveId();
        switch (driveId) {
          case id1:
            return Promise.resolve(drive1Tree);
          case id2:
            return Promise.resolve(drive2Tree);
        }
      });
      TestGraph.set($driveService, mockDriveService);

      const item1Tree = TreeMap.of<string, Item>(mockItem1)
          .set('item11Id', TreeMap.of(item11))
          .set('item12Id', TreeMap.of(item12));
      const item2Tree = TreeMap.of<string, Item>(mockItem2);
      Fakes.build(mockItemService.recursiveCreate)
          .when(drive1Tree).resolve(item1Tree)
          .when(drive2Tree).resolve(item2Tree);

      Fakes.build(spyOn(Persona, 'getValue'))
          .when($.results.children, search).return(ImmutableList.of([
            {selected: true, summary: {id: id1, name: name1}},
            {selected: true, summary: {id: id2, name: name2}},
            {selected: false, summary: {id: idUnadded}},
          ]))
          .when($.host.dispatcher, search).return(mockDispatcher);

      await search.onOkButtonAction_();
      assert(mockDispatcher).to.haveBeenCalledWith('th-item-added', {});

      const selectedFolder = mockItemService.save.calls.argsFor(4)[0];
      assert((selectedFolder as ThothFolder).getItems()).to.haveElements([id1, id2]);

      assert(mockItemService.save).to.haveBeenCalledWith(mockItem1);
      assert(mockItemService.save).to.haveBeenCalledWith(item11);
      assert(mockItemService.save).to.haveBeenCalledWith(item12);
      assert(mockItemService.save).to.haveBeenCalledWith(mockItem2);

      assert(mockItemService.recursiveCreate).to.haveBeenCalledWith(drive1Tree, idSelected);
      assert(mockItemService.recursiveCreate).to.haveBeenCalledWith(drive2Tree, idSelected);
    });

    it(`should reject if dispatcher cannot be found`, async () => {
      const idSelected = 'idSelected';
      TestGraph.set(
          $selectedItem,
          ThothFolder.newInstance(idSelected, 'test', null, ImmutableSet.of([])));

      Fakes.build(spyOn(Persona, 'getValue'))
          .when($.results.children, search).return(ImmutableList.of([]))
          .when($.host.dispatcher, search).return(null);

      const mockDriveService = jasmine.createSpyObj('DriveService', ['recursiveGet']);
      mockDriveService.recursiveGet.and.returnValue(Promise.resolve(ImmutableList.of([])));
      TestGraph.set($driveService, mockDriveService);

      await assert(search.onOkButtonAction_()).to.rejectWithError(/exist/);
    });

    it(`should reject if the current selected folder is not editable`, async () => {
      const idSelected = 'idSelected';
      TestGraph.set(
          $selectedItem,
          DriveFolder.newInstance(
              idSelected,
              'test',
              null,
              ImmutableSet.of([]),
              DriveSource.newInstance('driveId')));

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

      const mockDriveService = jasmine.createSpyObj('DriveService', ['recursiveGet']);
      mockDriveService.recursiveGet.and.returnValue(Promise.resolve(ImmutableList.of([])));
      TestGraph.set($driveService, mockDriveService);

      await assert(search.onOkButtonAction_()).to.rejectWithError(/selectedFolder/);
    });

    it(`should do nothing if there are no items selected`, async () => {
      TestGraph.set(
          $selectedItem,
          ThothFolder.newInstance('idSelected', 'test', null, ImmutableSet.of([])));

      const mockDriveService = jasmine.createSpyObj('DriveService', ['recursiveGet']);
      mockDriveService.recursiveGet.and.returnValue(Promise.resolve(ImmutableList.of([])));
      TestGraph.set($driveService, mockDriveService);

      spyOn(Persona, 'getValue').and.returnValue(null);
      spyOn(DriveStorage, 'read');

      await search.onOkButtonAction_();
      assert(mockDriveService.recursiveGet).toNot.haveBeenCalled();
      assert(DriveStorage.read).toNot.haveBeenCalled();
      assert(Persona.getValue).to.haveBeenCalledWith($.results.children, search);
    });
  });

  describe('renderDriveItems_', () => {
    it(`should return the correct list`, () => {
      const id1 = 'id1';
      const id2 = 'id2';
      const name1 = 'name1';
      const name2 = 'name2';

      const item1 = {id: id1, name: name1, type: ApiDriveType.MARKDOWN};
      const item2 = {id: id2, name: name2, type: ApiDriveType.FOLDER};
      const items = [item1, item2];
      assert(search.renderDriveItems_(items)).to.haveElements([
        {
          selected: null,
          summary: item1,
        },
        {
          selected: null,
          summary: item2,
        },
      ]);
    });
  });
});
