import { assert, Mocks, TestBase, TestDispose } from '../test-base';
TestBase.setup();

import { NumberType } from 'external/gs_tools/src/check';
import { instanceId } from 'external/gs_tools/src/graph';
import { Persona } from 'external/gs_tools/src/persona';
import { $location } from 'external/gs_tools/src/ui';

import { $, RootView } from '../main/root-view';


describe('main.RootView', () => {
  let view: RootView;

  beforeEach(() => {
    view = new RootView(Mocks.object('ThemeService'));
    TestDispose.add(view);
  });

  describe('onLocationChange_', () => {
    it(`should update the correct node`, () => {
      spyOn(Persona, 'updateValue');

      view.onLocationChange_({id: $location.path} as any);
      assert(Persona.updateValue).to.haveBeenCalledWith($.breadcrumb.crumb, view);
    });

    it(`should do nothing if the ID is not $location.path`, () => {
      spyOn(Persona, 'updateValue');

      view.onLocationChange_({id: instanceId('other', NumberType)} as any);
      assert(Persona.updateValue).toNot.haveBeenCalled();
    });
  });

  describe('renderCrumbs_', () => {
    it(`should return the correct crumbs`, () => {
      assert(view.renderCrumbs_(('/a/b'))).to.haveElements([
        {name: '(root)', url: '/'},
        {name: 'a', url: '/a'},
        {name: 'b', url: '/a/b'},
      ]);
    });
  });
});
