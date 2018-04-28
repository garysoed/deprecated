import { assert, Fakes, Mocks, TestBase, TestDispose } from '../test-base';
TestBase.setup();

import { Persona } from 'external/gs_tools/src/persona';

import { ImmutableSet } from 'external/gs_tools/src/immutable';
import { Folder, MarkdownFile } from '../data';
import { DriveSource, ThothSource } from '../datasource';
import { $, Navigator } from '../main/navigator';

describe('main.Navigator', () => {
  let navigator: Navigator;

  beforeEach(() => {
    navigator = new Navigator(Mocks.object('ThemeService'));
    TestDispose.add(navigator);
  });

  describe('onAddClick_', () => {
    it(`should dispatch the event`, () => {
      const mockDispatcher = jasmine.createSpy('Dispatcher');
      spyOn(Persona, 'getValue').and.returnValue(mockDispatcher);

      navigator.onAddClick_();
      assert(mockDispatcher).to.haveBeenCalledWith('th-add', null);
      assert(Persona.getValue).to.haveBeenCalledWith($.host.dispatch, navigator);
    });

    it(`should not throw errors if dispatcher cannot be found`, () => {
      spyOn(Persona, 'getValue').and.returnValue(null);

      assert(() => {
        navigator.onAddClick_();
      }).toNot.throw();
    });
  });

  describe('renderItems_', () => {
    it(`should return the correct items`, async () => {
      const childId1 = 'childId1';
      const childId2 = 'childId2';
      const id = 'id';
      const selectedItem = Folder.newInstance(
          id,
          'name',
          null,
          ImmutableSet.of([childId1, childId2]),
          ThothSource.newInstance());
      const child1 = MarkdownFile.newInstance(
          childId1,
          'child1',
          id,
          'content',
          ThothSource.newInstance());
      const child2 = MarkdownFile.newInstance(
          childId2,
          'child2',
          id,
          'content',
          ThothSource.newInstance());
      const mockItemService = jasmine.createSpyObj('ItemService', ['getItem']);
      Fakes.build(mockItemService.getItem)
          .when(childId1).resolve(child1)
          .when(childId2).resolve(child2);

      assert(await navigator.renderItems_(mockItemService, selectedItem))
          .to.haveElements([childId1, childId2]);
    });

    it(`should return no items if the selected item is not a folder`, async () => {
      const selectedItem = MarkdownFile.newInstance(
          'id',
          'name',
          'parentId',
          'content',
          DriveSource.newInstance('driveId'));
      const itemService = Mocks.object('itemService');

      assert(await navigator.renderItems_(itemService, selectedItem)).to.haveElements([]);
    });
  });
});
