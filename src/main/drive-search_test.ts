import { assert, Mocks, TestBase, TestDispose } from '../test-base';
TestBase.setup();

import { Graph } from 'external/gs_tools/src/graph';
import { ImmutableSet } from 'external/gs_tools/src/immutable';
import { Persona } from 'external/gs_tools/src/persona';

import { DriveType } from '../import/drive';
import { DriveStorage } from '../import/drive-storage';
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
    itemEl.setAttribute('id', id);
    itemEl.setAttribute('text', name);
    itemEl.setAttribute('type', type);

    const element = document.createElement('div');
    element.appendChild(itemEl);

    assert(driveItemsGetter(element)).to.equal({id, name, type: DriveType.MARKDOWN});
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

    driveItemsSetter({id, name, type: DriveType.MARKDOWN}, element);
    assert(itemEl.getAttribute('id')).to.equal(id);
    assert(itemEl.getAttribute('text')).to.equal(name);
    assert(itemEl.getAttribute('type')).to.equal('markdown');
  });
});

describe('main.DriveSearch', () => {
  let search: DriveSearch;

  beforeEach(() => {
    search = new DriveSearch(Mocks.object('ThemeService'));
    TestDispose.add(search);
  });

  describe('onInputChange_', () => {
    it(`should update the provider correctly`, async () => {
      const query = 'query';
      spyOn(Persona, 'getValue').and.returnValue(query);

      const item1 = {id: 'id1', name: 'name1', type: DriveType.MARKDOWN};
      const item2 = {id: 'id2', name: 'name2', type: DriveType.FOLDER};
      spyOn(DriveStorage, 'search').and
          .returnValue(Promise.resolve(ImmutableSet.of([item1, item2])));

      await search.onInputChange_();
      const items = await Graph.get($driveItems, Graph.getTimestamp(), search);
      assert([...items]).to.equal([item1, item2]);
      assert(DriveStorage.search).to.haveBeenCalledWith(query);
      assert(Persona.getValue).to.haveBeenCalledWith($.input.value, search);
    });
  });
});
