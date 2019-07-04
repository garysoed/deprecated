import { RuleType } from './rule-type';

export interface Rule {
  /**
   * Name is a path relative to the project root, including the rule name.
   */
  name: string;
  type: RuleType;
}
