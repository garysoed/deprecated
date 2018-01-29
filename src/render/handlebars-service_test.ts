import { assert, TestBase } from '../test-base';
TestBase.setup();

import { ImmutableMap } from 'external/gs_tools/src/immutable';

import { HandlebarsServiceClass } from '../render/handlebars-service';


describe('render.HandlebarsServiceClass', () => {
  let mockHandlebars: any;
  let service: HandlebarsServiceClass;

  beforeEach(() => {
    mockHandlebars = jasmine.createSpyObj('Handlebars', ['compile']);
    window['Handlebars'] = mockHandlebars;
    service = new HandlebarsServiceClass();
  });

  describe('render', () => {
    it(`should compile correctly`, () => {
      const content = 'content';
      const template = 'template';
      const globalsJson = {a: '1', b: '2'};
      const globals = ImmutableMap.of(globalsJson);

      const compiled = 'compiled';
      const mockCompiledTemplate = jasmine.createSpy('CompiledTemplate');
      mockCompiledTemplate.and.returnValue(compiled);
      mockHandlebars.compile.and.returnValue(mockCompiledTemplate);

      assert(service.render(content, template, globals)).to.equal(compiled);
      assert(mockCompiledTemplate).to.haveBeenCalledWith({
        $mainContent: content,
        ...globalsJson,
      });
      assert(mockHandlebars.compile).to.haveBeenCalledWith(template);
    });
  });
});
