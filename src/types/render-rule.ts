import { Rule } from './rule';
import { RuleType } from './rule-type';

export interface RenderRule extends Rule {
  /**
   * Each entry's value is an array of other render rules or resolved file.
   */
  inputs: {[key: string]: Array<string|RenderRule>};
  /**
   * File names created by the render rule.
   */
  outputs: string[];
  type: RuleType.RENDER;
}
