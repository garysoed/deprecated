import { ObjectType } from '@gs-types';
import { RuleSpec, TYPE as RULE_SPEC_TYPE } from './rule-spec';

export interface ConfigSpec {
  [ruleName: string]: RuleSpec;
}

export const TYPE = ObjectType.stringKeyed<RuleSpec>(RULE_SPEC_TYPE);
