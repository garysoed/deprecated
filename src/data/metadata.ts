import { ImmutableMap } from 'external/gs_tools/src/immutable';
import { AbsolutePath } from 'external/gs_tools/src/path';

type TemplatePath = AbsolutePath;

export class Metadata {
  private readonly globals_: ImmutableMap<string, string>;
  private readonly templates_: ImmutableMap<string, TemplatePath>;

  constructor(
      private readonly defaultTemplate_: TemplatePath | null = null,
      globals: {[key: string]: string} = {},
      templates: {[filename: string]: TemplatePath} = {}) {
    this.globals_ = ImmutableMap.of(globals);
    this.templates_ = ImmutableMap.of(templates);
  }

  getDefaultTemplatePath(): TemplatePath | null {
    return this.defaultTemplate_;
  }

  getGlobals(): ImmutableMap<string, string> {
    return this.globals_;
  }

  getTemplates(): ImmutableMap<string, TemplatePath> {
    return this.templates_;
  }
}
