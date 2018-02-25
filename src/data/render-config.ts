import { ImmutableMap } from 'external/gs_tools/src/immutable';
import { AbsolutePath } from 'external/gs_tools/src/path';

type ShowdownConfig = ImmutableMap<string, string>;
type TemplatePath = AbsolutePath;

/**
 * Unliked Metadata file, this contains the *resolved* metadata values.
 */
export class RenderConfig {
  constructor(
      private readonly showdownConfig_: ShowdownConfig,
      private readonly template_: TemplatePath | null,
      private readonly variables_: ImmutableMap<string, string>) {
  }

  getShowdownConfig(): ShowdownConfig {
    return this.showdownConfig_;
  }

  getTemplate(): TemplatePath | null {
    return this.template_;
  }

  getVariables(): ImmutableMap<string, string> {
    return this.variables_;
  }
}
