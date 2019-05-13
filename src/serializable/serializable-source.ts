import { EnumType, HasPropertiesType } from '@gs-types';
import { SourceType } from '../datamodel/source-type';

export interface SerializableSource {
  type: SourceType;
}

export const SerializableSourceType = HasPropertiesType<SerializableSource>({
  type: EnumType(SourceType),
});
