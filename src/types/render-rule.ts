import { Rule } from './rule';
import { RuleType } from './rule-type';

export type RenderInputs = Map<string, string[]>;

export interface RenderRule extends Rule {
  /**
   * These rules must be ran before running the processor. Running them should generate the files
   * specified in the inputs.
   */
  deps: RenderRule[];
  /**
   * Each entry's value is an array of files, either existing or generated from other rules.
   */
  inputs: RenderInputs;
  /**
   * File names created by the render rule.
   */
  outputs: string[];
  type: RuleType.RENDER;
}
