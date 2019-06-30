import { Glob } from './glob';
import { RuleSpec } from './rule-spec';
import { RuleType } from './rule-type';

export interface RenderSpec extends RuleSpec {
  inputs: {
    [key: string]: string|Glob;
  };
  out: string;
  processor: string;
  type: RuleType.RENDER;
}
