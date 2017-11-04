import { assert, Fakes, Mocks, TestBase, TestDispose } from '../test-base';
TestBase.setup();

import { FakeDataGraph } from 'external/gs_tools/src/datamodel';
import { FLAGS as GraphFlags, Graph } from 'external/gs_tools/src/graph';
import { ImmutableList, ImmutableSet } from 'external/gs_tools/src/immutable';
import { Persona } from 'external/gs_tools/src/persona';

import { DriveFile } from '../data/drive-file';
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

  describe('createAddedItem_', () => {
    it(`should recursively add the folder contents`, async () => {
      const idRoot = 'idRoot';
      const nameRoot = 'nameRoot';

      const id1 = 'id1';
      const name1 = 'name1';
      const content1 = 'content1';

      const idSub = 'idSub';
      const nameSub = 'nameSub';

      const id21 = 'id21';
      const name21 = 'name21';
      const content21 = 'content21';

      const id22 = 'id22';
      const name22 = 'name22';
      const content22 = 'content22';

      const addedItem = {
        files: [
          {
            content: content1,
            files: [],
            summary: {id: id1, name: name1, type: ApiDriveType.MARKDOWN},
          },
          {
            files: [
              {
                content: content21,
                files: [],
                summary: {id: id21, name: name21, type: ApiDriveType.MARKDOWN},
              },
              {
                content: content22,
                files: [],
                summary: {id: id22, name: name22, type: ApiDriveType.MARKDOWN},
              },
            ],
            summary: {id: idSub, name: nameSub, type: ApiDriveType.FOLDER},
          },
        ],
        summary: {id: idRoot, name: nameRoot, type: ApiDriveType.FOLDER},
      };

      const parentFolderId = 'parentFolderId';
      const itemsDataGraph = new FakeDataGraph<ItemImpl>();

      await search['createAddedItem_'](addedItem, parentFolderId, itemsDataGraph);
      const [rootFolder, file1, subFolder, file21, file22] = await Promise.all([
        itemsDataGraph.get(idRoot),
        itemsDataGraph.get(id1),
        itemsDataGraph.get(idSub),
        itemsDataGraph.get(id21),
        itemsDataGraph.get(id22),
      ]);

      assert(rootFolder!.getId()).to.equal(idRoot);
      assert(rootFolder!.getName()).to.equal(nameRoot);
      assert(rootFolder!.getParentId()).to.equal(parentFolderId);
      assert((rootFolder as DriveFolder).getItems()).to.haveElements([id1, idSub]);

      assert(file1!.getId()).to.equal(id1);
      assert(file1!.getName()).to.equal(name1);
      assert(file1!.getParentId()).to.equal(idRoot);
      assert((file1 as DriveFile).getContent()).to.equal(content1);

      assert(subFolder!.getId()).to.equal(idSub);
      assert(subFolder!.getName()).to.equal(nameSub);
      assert(subFolder!.getParentId()).to.equal(idRoot);
      assert((subFolder as DriveFolder).getItems()).to.haveElements([id21, id22]);

      assert(file21!.getId()).to.equal(id21);
      assert(file21!.getName()).to.equal(name21);
      assert(file21!.getParentId()).to.equal(idSub);
      assert((file21 as DriveFile).getContent()).to.equal(content21);

      assert(file22!.getId()).to.equal(id22);
      assert(file22!.getName()).to.equal(name22);
      assert(file22!.getParentId()).to.equal(idSub);
      assert((file22 as DriveFile).getContent()).to.equal(content22);
    });

    it(`should handle files correctly`, async () => {
      const id = 'id1';
      const name = 'name1';
      const content = 'content1';

      const addedItem = {
        content: content,
        files: [],
        summary: {id: id, name: name, type: ApiDriveType.MARKDOWN},
      };

      const parentFolderId = 'parentFolderId';
      const itemsDataGraph = new FakeDataGraph<ItemImpl>();

      await search['createAddedItem_'](addedItem, parentFolderId, itemsDataGraph);
      const [file] = await Promise.all([
        itemsDataGraph.get(id),
      ]);

      assert(file!.getId()).to.equal(id);
      assert(file!.getName()).to.equal(name);
      assert(file!.getParentId()).to.equal(parentFolderId);
      assert((file as DriveFile).getContent()).to.equal(content);
    });
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

      spyOn(search, 'createAddedItem_').and.returnValue(Promise.resolve());

      await search.onOkButtonAction_();
      const selectedFolder = await itemsDataGraph.get(idSelected);

      assert((selectedFolder as ThothFolder).getItems()).to.haveElements([id1, id2]);

      assert(search['createAddedItem_']).to.haveBeenCalledWith(data1, idSelected, itemsDataGraph);
      assert(search['createAddedItem_']).to.haveBeenCalledWith(data2, idSelected, itemsDataGraph);

      assert(DriveStorage.read).to.haveBeenCalledWith(id1);
      assert(DriveStorage.read).to.haveBeenCalledWith(id2);
      assert(DriveStorage.read).toNot.haveBeenCalledWith(idUnadded);

      assert(Persona.getValue).to.haveBeenCalledWith($.results.children, search);
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

      spyOn(search, 'createAddedItem_').and.returnValue(Promise.resolve());

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
      spyOn(search, 'createAddedItem_').and.returnValue(Promise.resolve());

      await search.onOkButtonAction_();
      assert(search['createAddedItem_']).toNot.haveBeenCalled();
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
