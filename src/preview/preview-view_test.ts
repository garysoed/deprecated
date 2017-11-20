import { assert, Mocks, TestBase, TestDispose } from '../test-base';
TestBase.setup();

import { Graph } from 'external/gs_tools/src/graph';
import { Persona } from 'external/gs_tools/src/persona';

import { ItemService, PreviewFile } from '../data';
import { PreviewView } from '../preview/preview-view';


describe('preview.PreviewView', () => {
  let fakeDocument: any;
  let fakeWindow: any;
  let view: PreviewView;

  beforeEach(() => {
    fakeDocument = Mocks.object('fakeDocument');
    fakeWindow = Mocks.object('fakeWindow');
    view = new PreviewView(fakeDocument, fakeWindow);
    TestDispose.add(view);
  });

  describe('onHostConnected_', () => {
    it(`should update the shadow root correctly`, async () => {
      const scriptEl1 = document.createElement('script');
      const scriptEl2 = document.createElement('script');
      const mockShadowRoot = jasmine.createSpyObj('ShadowRoot', ['querySelectorAll']);
      mockShadowRoot.querySelectorAll.and.returnValue([scriptEl1, scriptEl2]);
      spyOn(Persona, 'getShadowRoot').and.returnValue(mockShadowRoot);

      const content = 'content';
      const baseUrl = 'baseUrl/';
      fakeDocument.baseURI = baseUrl;

      const selectedItemId = '/selectedItemId';
      fakeWindow.location = {href: `baseUrl/selectedItemId`};

      const item = PreviewFile.newInstance('id', content);
      spyOn(ItemService, 'getPreview').and.returnValue(Promise.resolve(item));

      const time = Graph.getTimestamp();

      spyOn(view, 'processScript_');

      await view.onHostConnected_();
      assert(view['processScript_']).to.haveBeenCalledWith(scriptEl1);
      assert(view['processScript_']).to.haveBeenCalledWith(scriptEl2);
      assert(mockShadowRoot.querySelectorAll).to.haveBeenCalledWith('script');
      assert(mockShadowRoot.innerHTML).to.equal(content);
      assert(ItemService.getPreview).to.haveBeenCalledWith(time, selectedItemId);
      assert(Persona.getShadowRoot).to.haveBeenCalledWith(view);
    });

    it(`should set the innerHTML to "" if selected item doesn't exist`, async () => {
      const mockShadowRoot = jasmine.createSpyObj('ShadowRoot', ['querySelectorAll']);
      mockShadowRoot.querySelectorAll.and.returnValue([]);
      spyOn(Persona, 'getShadowRoot').and.returnValue(mockShadowRoot);

      const baseUrl = 'baseUrl/';
      fakeDocument.baseURI = baseUrl;

      const selectedItemId = '/selectedItemId';
      fakeWindow.location = {href: `baseUrl/selectedItemId`};
      spyOn(ItemService, 'getPreview').and.returnValue(Promise.resolve(null));

      const time = Graph.getTimestamp();

      spyOn(view, 'processScript_');

      await view.onHostConnected_();
      assert(mockShadowRoot.querySelectorAll).toNot.haveBeenCalled();
      assert(mockShadowRoot.innerHTML).to.equal('');
      assert(ItemService.getPreview).to.haveBeenCalledWith(time, selectedItemId);
      assert(Persona.getShadowRoot).to.haveBeenCalledWith(view);
    });

    it(`should not reject if there are no shadow roots`, async () => {
      spyOn(Persona, 'getShadowRoot').and.returnValue(null);

      await view.onHostConnected_();
    });
  });
});
