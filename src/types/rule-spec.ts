import { EnumType, HasPropertiesType } from '@gs-types';
import { RuleType } from './rule-type';

export interface RuleSpec {
  type: RuleType;
}

export const TYPE = HasPropertiesType<RuleSpec>({
  type: EnumType(RuleType),
});
