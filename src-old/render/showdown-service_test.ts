import { assert, TestBase } from '../test-base';
TestBase.setup();

import { ImmutableMap } from 'external/gs_tools/src/immutable';
import { ShowdownService } from '../render/showdown-service';


describe('render.ShowdownService', () => {
  describe('render', () => {
    it(`should render correctly`, () => {
      const raw = 'raw';
      const key1 = 'key1';
      const key2 = 'key2';
      const value1 = 'value1';
      const value2 = 'value2';
      const options = createImmutableMap([
        [key1, value1],
        [key2, value2],
      ]);

      const rendered = 'rendered';
      const mockConverter = jasmine.createSpyObj('Converter', ['makeHtml', 'setOption']);
      mockConverter.makeHtml.and.returnValue(rendered);
      spyOn(ShowdownService, 'getConverter_').and.returnValue(mockConverter);

      assert(ShowdownService.render(raw, options)).to.equal(rendered);
      assert(mockConverter.makeHtml).to.haveBeenCalledWith(raw);
      assert(mockConverter.setOption).to.haveBeenCalledWith(key1, value1);
      assert(mockConverter.setOption).to.haveBeenCalledWith(key2, value2);
    });
  });
});
