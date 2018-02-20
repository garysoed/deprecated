import { ImmutableMap } from 'external/gs_tools/src/immutable';
import { AbsolutePath } from 'external/gs_tools/src/path';

type ShowdownConfig = ImmutableMap<string, string>;
type TemplatePath = AbsolutePath;

const DEFAULT_KEY = '$default';

/**
 * Unliked Metadata file, this contains the *resolved* metadata values.
 */
export class ResolvedMetadata {
  constructor(
      private readonly globals_: ImmutableMap<string, string>,
      private readonly showdownConfigs_: ImmutableMap<string, ShowdownConfig>,
      private readonly templates_: ImmutableMap<string, TemplatePath>) {
  }

  getDefaultShowdownConfig(): ShowdownConfig | null {
    return this.showdownConfigs_.get(DEFAULT_KEY) || null;
  }

  getDefaultTemplatePath(): TemplatePath | null {
    return this.templates_.get(DEFAULT_KEY) || null;
  }

  getGlobals(): ImmutableMap<string, string> {
    return this.globals_;
  }

  getShowdownConfigForPath(path: AbsolutePath): ShowdownConfig {
    const defaultConfig = this.getDefaultShowdownConfig() || ImmutableMap.of([]);
    const overrideConfig = this.showdownConfigs_.get(path.toString()) || ImmutableMap.of([]);
    return defaultConfig.addAll(overrideConfig);
  }

  getShowdownConfigs(): ImmutableMap<string, ShowdownConfig> {
    return this.showdownConfigs_;
  }

  getTemplates(): ImmutableMap<string, TemplatePath> {
    return this.templates_;
  }
}
