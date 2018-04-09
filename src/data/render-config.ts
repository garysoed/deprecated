import { ImmutableMap } from 'external/gs_tools/src/immutable';
import { AbsolutePath } from 'external/gs_tools/src/path';

type ProcessorPath = AbsolutePath;
type ShowdownConfig = ImmutableMap<string, string>;
type TemplatePath = AbsolutePath;

/**
 * Unliked Metadata file, this contains the *resolved* metadata values.
 */
export type RenderConfig = {
  processor: ProcessorPath | null,
  showdownConfig: ShowdownConfig,
  template: TemplatePath | null,
  variables: ImmutableMap<string, string>,
};
