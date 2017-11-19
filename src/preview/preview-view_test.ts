import { assert, Matchers, Mocks, TestBase, TestDispose } from '../test-base';
TestBase.setup();

import { Graph } from 'external/gs_tools/src/graph';
import { Persona } from 'external/gs_tools/src/persona';
import { $location } from 'external/gs_tools/src/ui';

import { ItemService, PreviewFile } from '../data';
import { PreviewView } from '../preview/preview-view';


describe('preview.PreviewView', () => {
  let view: PreviewView;

  beforeEach(() => {
    view = new PreviewView();
    TestDispose.add(view);
  });

  describe('onHostConnected_', () => {
    it(`should listen to the graph and initialize correctly`, () => {
      const onReadySpy = spyOn(Graph, 'onReady');
      const onChangedSpy = spyOn(view, 'onLocationChanged_');

      view.onHostConnected_();
      assert(view['onLocationChanged_']).to.haveBeenCalledWith();

      assert(Graph.onReady).to.haveBeenCalledWith(null, $location.path, Matchers.anyFunction());
      onChangedSpy.calls.reset();
      onReadySpy.calls.argsFor(0)[2]();
      assert(view['onLocationChanged_']).to.haveBeenCalledWith();
    });
  });

  describe('onLocationChanged_', () => {
    it(`should update the shadow root correctly`, async () => {
      const shadowRoot = Mocks.object('shadowRoot');
      spyOn(Persona, 'getShadowRoot').and.returnValue(shadowRoot);

      const content = 'content';
      const selectedItemId = 'selectedItemId';
      spyOn(Graph, 'get').and.returnValue(Promise.resolve(selectedItemId));
      const item = PreviewFile.newInstance('id', content);
      spyOn(ItemService, 'getPreview').and.returnValue(Promise.resolve(item));

      const time = Graph.getTimestamp();

      await view['onLocationChanged_']();
      assert(shadowRoot.innerHTML).to.equal(content);
      assert(Graph.get).to.haveBeenCalledWith($location.path, time);
      assert(ItemService.getPreview).to.haveBeenCalledWith(time, selectedItemId);
      assert(Persona.getShadowRoot).to.haveBeenCalledWith(view);
    });

    it(`should set the innerHTML to "" if selected item doesn't exist`, async () => {
      const shadowRoot = Mocks.object('shadowRoot');
      spyOn(Persona, 'getShadowRoot').and.returnValue(shadowRoot);

      const selectedItemId = 'selectedItemId';
      spyOn(Graph, 'get').and.returnValue(Promise.resolve(selectedItemId));
      spyOn(ItemService, 'getPreview').and.returnValue(Promise.resolve(null));

      const time = Graph.getTimestamp();

      await view['onLocationChanged_']();
      assert(shadowRoot.innerHTML).to.equal('');
      assert(Graph.get).to.haveBeenCalledWith($location.path, time);
      assert(ItemService.getPreview).to.haveBeenCalledWith(time, selectedItemId);
      assert(Persona.getShadowRoot).to.haveBeenCalledWith(view);
    });

    it(`should not reject if there are no shadow roots`, async () => {
      spyOn(Persona, 'getShadowRoot').and.returnValue(null);

      await view['onLocationChanged_']();
    });
  });
});
