import { ArrayOfType, EqualType, HasPropertiesType, InstanceofType, IntersectType, ObjectType, StringType, UnionType } from '@gs-types';

import { RuleSpec, TYPE as RULE_SPEC_TYPE } from './rule-spec';
import { RuleType } from './rule-type';
import { Glob } from './yaml/glob';

/**
 * Spec obtained by parsing YAML file.
 */
export interface RenderSpec extends RuleSpec {
  inputs: {
    [key: string]: string|Glob|Array<string|Glob>;
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
      ArrayOfType(UnionType([StringType, InstanceofType(Glob)])),
    ])),
    output: StringType,
    processor: StringType,
    type: EqualType(RuleType.RENDER),
  }),
]);
