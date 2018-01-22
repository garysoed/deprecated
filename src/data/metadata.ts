import { ImmutableMap } from 'external/gs_tools/src/immutable';
import { AbsolutePath } from 'external/gs_tools/src/path';

type TemplateType = AbsolutePath;

export class Metadata {
  constructor(
      private readonly defaultTemplate_: TemplateType,
      private readonly globals_: {[key: string]: string} = {},
      private readonly templates_: {[filename: string]: TemplateType} = {}) { }

  getDefaultTemplatePath(): AbsolutePath {
    return this.defaultTemplate_;
  }

  getTemplates(): ImmutableMap<string, AbsolutePath> {
    return ImmutableMap.of(this.templates_);
  }

  getValues(): ImmutableMap<string, string> {
    return ImmutableMap.of(this.globals_);
  }
}
