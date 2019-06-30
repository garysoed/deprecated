import { ArrayOfType, EqualType, HasPropertiesType, InstanceofType, IntersectType, ObjectType, StringType, UnionType } from '@gs-types';

import { Glob } from './glob';
import { RuleSpec, TYPE as RULE_SPEC_TYPE } from './rule-spec';
import { RuleType } from './rule-type';

export interface RenderSpec extends RuleSpec {
  inputs: {
    [key: string]: string|Glob|string[];
  };
  output: string;
  processor: string;
  type: RuleType.RENDER;
}

export const TYPE = IntersectType<RenderSpec>([
  RULE_SPEC_TYPE,
  HasPropertiesType<RenderSpec>({
    inputs: ObjectType.stringKeyed(UnionType([
      StringType,
      InstanceofType(Glob),
      ArrayOfType(StringType),
    ])),
    output: StringType,
    processor: StringType,
    type: EqualType(RuleType.RENDER),
  }),
]);
