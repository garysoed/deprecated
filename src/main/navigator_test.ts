import { assert, Mocks, TestBase, TestDispose } from '../test-base';
TestBase.setup();

import { ImmutableSet } from 'external/gs_tools/src/immutable';
import { Persona } from 'external/gs_tools/src/persona';

import { MarkdownFile, ThothFolder } from '../data';
import { DriveSource } from '../datasource';
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
    it(`should return the correct items`, () => {
      const childId1 = 'childId1';
      const childId2 = 'childId2';
      const selectedItem = ThothFolder
          .newInstance('id', 'name', null, ImmutableSet.of([childId1, childId2]));

      assert(navigator.renderItems_(selectedItem)).to.haveElements([childId1, childId2]);
    });

    it(`should return no items if the selected item is not a folder`, () => {
      const selectedItem = MarkdownFile.newInstance(
          'id',
          'name',
          'parentId',
          'content',
          DriveSource.newInstance('driveId'));

      assert(navigator.renderItems_(selectedItem)).to.haveElements([]);
    });
  });
});
