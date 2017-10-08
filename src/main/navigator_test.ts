import { assert, Mocks, TestBase, TestDispose } from '../test-base';
TestBase.setup();

import { Persona } from 'external/gs_tools/src/persona';

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
});
