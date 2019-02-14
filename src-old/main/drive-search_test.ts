import { assert, Fakes, Mocks, TestBase, TestDispose, TestGraph } from '../test-base';
TestBase.setup();

import { FLAGS as GraphFlags, Graph } from 'external/gs_tools/src/graph';
import { ImmutableList, ImmutableSet } from 'external/gs_tools/src/immutable';
import { Persona } from 'external/gs_tools/src/persona';

import { $itemService, $selectedItem, EditableFolder } from '../data';
import { ApiFileType, DriveSource, DriveStorage, ThothSource } from '../datasource';
import { $, $driveItems, driveItemsGetter, driveItemsSetter, DriveSearch } from '../main/drive-search';

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
      summary: {id, name, type: ApiFileType.MARKDOWN},
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

    driveItemsSetter({selected: false, summary: {id, name, type: ApiFileType.MARKDOWN}}, element);
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

      spyOn(DriveStorage, 'search').and.returnValue(Promise.resolve(createImmutableList([
        {
          name: name1,
          source: DriveSource.newInstance(id1),
          type: ApiFileType.MARKDOWN,
        },
        {
          name: name2,
          source: DriveSource.newInstance(id2),
          type: ApiFileType.FOLDER,
        },
      ])));

      await search.onInputChange_();
      const items = await Graph.get($driveItems, Graph.getTimestamp(), search);
      assert([...items]).to.equal([
        {id: id1, name: name1, type: ApiFileType.MARKDOWN},
        {id: id2, name: name2, type: ApiFileType.FOLDER},
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
          EditableFolder.newInstance(
              idSelected,
              'test',
              null,
              ImmutableSet.of([]),
              ThothSource.newInstance()));

      const mockItemService = jasmine.createSpyObj('ItemService', ['addItems']);
      TestGraph.set($itemService, mockItemService);

      const id1 = 'id1';
      const id2 = 'id2';
      const idUnadded = 'idUnadded';
      const mockDispatcher = jasmine.createSpy('Dispatcher');

      Fakes.build(spyOn(Persona, 'getValue'))
          .when($.results.children, search).return(createImmutableList([
            {selected: true, summary: {id: id1, name: 'name1'}},
            {selected: true, summary: {id: id2, name: 'name2'}},
            {selected: false, summary: {id: idUnadded}},
          ]))
          .when($.host.dispatcher, search).return(mockDispatcher);

      await search.onOkButtonAction_();
      assert(mockDispatcher).to.haveBeenCalledWith('th-item-added', {});

      assert(mockItemService.addItems).to
          .haveBeenCalledWith(jasmine.any(DriveSource), idSelected);
      assert(mockItemService.addItems.calls.argsFor(0)[0].getDriveId()).to.equal(id1);
      assert(mockItemService.addItems.calls.argsFor(1)[0].getDriveId()).to.equal(id2);
    });

    it(`should reject if dispatcher cannot be found`, async () => {
      const idSelected = 'idSelected';
      TestGraph.set(
          $selectedItem,
          EditableFolder.newInstance(
              idSelected,
              'test',
              null,
              ImmutableSet.of([]),
              ThothSource.newInstance()));

      Fakes.build(spyOn(Persona, 'getValue'))
          .when($.results.children, search).return(createImmutableList([]))
          .when($.host.dispatcher, search).return(null);

      await assert(search.onOkButtonAction_()).to.rejectWithError(/exist/);
    });

    it(`should do nothing if there are no items selected`, async () => {
      const idSelected = 'idSelected';
      TestGraph.set(
          $selectedItem,
          EditableFolder.newInstance(
              idSelected,
              'test',
              null,
              ImmutableSet.of([]),
              ThothSource.newInstance()));

      const mockItemService = jasmine.createSpyObj('ItemService', ['addItems']);
      TestGraph.set($itemService, mockItemService);

      spyOn(Persona, 'getValue').and.returnValue(null);

      await search.onOkButtonAction_();
      assert(Persona.getValue).to.haveBeenCalledWith($.results.children, search);
      assert(mockItemService.addItems).toNot.haveBeenCalled();
    });
  });

  describe('renderDriveItems_', () => {
    it(`should return the correct list`, () => {
      const id1 = 'id1';
      const id2 = 'id2';
      const name1 = 'name1';
      const name2 = 'name2';

      const item1 = {id: id1, name: name1, type: ApiFileType.MARKDOWN};
      const item2 = {id: id2, name: name2, type: ApiFileType.FOLDER};
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
