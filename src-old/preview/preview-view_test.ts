import { assert, Mocks, PathMatcher, TestBase, TestDispose, TestGraph } from '../test-base';
TestBase.setup();

import { $previewService, PreviewFile } from '../data';
import { PreviewView } from '../preview/preview-view';


describe('preview.PreviewView', () => {
  let mockDocument: any;
  let mockDomParser: any;
  let fakeWindow: any;
  let view: PreviewView;

  beforeEach(() => {
    mockDocument = jasmine.createSpyObj('Document', ['write']);
    mockDomParser = jasmine.createSpyObj('DomParser', ['parseFromString']);
    fakeWindow = Mocks.object('fakeWindow');
    view = new PreviewView(mockDocument, fakeWindow, mockDomParser);
    TestDispose.add(view);
  });

  describe('onHostConnected_', () => {
    it(`should update the document correctly`, async () => {
      const content = 'content';

      const outerHTML = 'outerHTML';
      const scriptEl1 = document.createElement('script');
      const scriptEl2 = document.createElement('script');
      const mockParsedContent = jasmine.createSpyObj('ParsedContent', ['querySelectorAll']);
      mockParsedContent.querySelectorAll.and.returnValue([scriptEl1, scriptEl2]);
      mockParsedContent.documentElement = {outerHTML};
      mockDomParser.parseFromString.and.returnValue(mockParsedContent);

      const baseUrl = 'baseUrl/';
      mockDocument.baseURI = baseUrl;

      const selectedItemPath = '/selectedItemId';
      fakeWindow.location = {href: `baseUrl/selectedItemId`};

      const item = PreviewFile.newInstance('id', content);
      const mockPreviewService = jasmine.createSpyObj('PreviewService', ['get']);
      mockPreviewService.get.and.returnValue(Promise.resolve(item));
      TestGraph.set($previewService, mockPreviewService);

      spyOn(view, 'processScript_');

      await view.onHostConnected_();
      assert(mockDocument.write).to.haveBeenCalledWith(outerHTML);
      assert(view['processScript_']).to.haveBeenCalledWith(scriptEl1);
      assert(view['processScript_']).to.haveBeenCalledWith(scriptEl2);
      assert(mockParsedContent.querySelectorAll).to.haveBeenCalledWith('script');
      assert(mockDomParser.parseFromString).to.haveBeenCalledWith(content, 'text/html');
      assert(mockPreviewService.get).to.haveBeenCalledWith(PathMatcher.with(selectedItemPath));
    });

    it(`should write error message to document if selected item doesn't exist`, async () => {
      const mockParsedContent = jasmine.createSpyObj('ParsedContent', ['querySelectorAll']);
      mockParsedContent.querySelectorAll.and.returnValue([]);

      const baseUrl = 'baseUrl/';
      mockDocument.baseURI = baseUrl;

      const selectedItemPath = '/selectedItemId';
      fakeWindow.location = {href: `baseUrl/selectedItemId`};

      const mockPreviewService = jasmine.createSpyObj('PreviewService', ['get']);
      mockPreviewService.get.and.returnValue(Promise.resolve(null));
      TestGraph.set($previewService, mockPreviewService);

      spyOn(view, 'processScript_');

      await view.onHostConnected_();
      assert(mockParsedContent.querySelectorAll).toNot.haveBeenCalled();
      assert(mockDocument.write).to.haveBeenCalledWith(`${selectedItemPath} cannot be found`);
      assert(mockPreviewService.get).to.haveBeenCalledWith(PathMatcher.with(selectedItemPath));
    });
  });
});
