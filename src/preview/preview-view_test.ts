import { assert, Matchers, Mocks, TestBase, TestDispose } from '../test-base';
TestBase.setup();

import { Graph } from 'external/gs_tools/src/graph';
import { Persona } from 'external/gs_tools/src/persona';

import { ItemType } from '../data';
import { DriveFile } from '../data/drive-file';
import { PreviewFile } from '../data/preview-file';
import { $selectedItem } from '../main/selected-folder-graph';
import { PreviewView } from '../preview/preview-view';


describe('preview.PreviewView', () => {
  let view: PreviewView;

  beforeEach(() => {
    view = new PreviewView();
    TestDispose.add(view);
  });

  describe('onHostConnected_', () => {
    fit(`should listen to the graph and initialize correctly`, () => {
      const onReadySpy = spyOn(Graph, 'onReady');
      const onChangedSpy = spyOn(view, 'onSelectedItemChanged_');

      view.onHostConnected_();
      assert(view['onSelectedItemChanged_']).to.haveBeenCalledWith();

      assert(Graph.onReady).to.haveBeenCalledWith(null, $selectedItem, Matchers.anyFunction());
      onChangedSpy.calls.reset();
      onReadySpy.calls.argsFor(0)[2]();
      assert(view['onSelectedItemChanged_']).to.haveBeenCalledWith();
    });
  });

  describe('onSelectedItemChanged_', () => {
    fit(`should update the shadow root correctly`, async () => {
      const shadowRoot = Mocks.object('shadowRoot');
      spyOn(Persona, 'getShadowRoot').and.returnValue(shadowRoot);

      const content = 'content';
      const item = PreviewFile.newInstance('id', 'name', 'parentId', content, 'originalId');
      spyOn(Graph, 'get').and.returnValue(Promise.resolve(item));

      await view['onSelectedItemChanged_']();
      assert(shadowRoot.innerHTML).to.equal(content);
      assert(Graph.get).to.haveBeenCalledWith($selectedItem, Graph.getTimestamp());
      assert(Persona.getShadowRoot).to.haveBeenCalledWith(view);
    });

    fit(`should set the innerHTML to "" if selected item is not a preview file`, async () => {
      const shadowRoot = Mocks.object('shadowRoot');
      spyOn(Persona, 'getShadowRoot').and.returnValue(shadowRoot);

      const item = DriveFile.newInstance('id', 'name', 'parentId', ItemType.ASSET, 'content');
      spyOn(Graph, 'get').and.returnValue(Promise.resolve(item));

      await view['onSelectedItemChanged_']();
      assert(shadowRoot.innerHTML).to.equal('');
      assert(Graph.get).to.haveBeenCalledWith($selectedItem, Graph.getTimestamp());
      assert(Persona.getShadowRoot).to.haveBeenCalledWith(view);
    });

    fit(`should not reject if there are no shadow roots`, async () => {
      spyOn(Persona, 'getShadowRoot').and.returnValue(null);

      await view['onSelectedItemChanged_']();
    });
  });
});
