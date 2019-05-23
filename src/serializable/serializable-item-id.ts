import { EnumType, HasPropertiesType, StringType } from '@gs-types';
import { Result, Serializable } from '@nabu';
import { SourceType } from '../datamodel/source-type';

export interface SerializableItemId extends Record<string, string|SourceType> {
  readonly id: string;
  readonly source: SourceType;
}

export const SerializableItemIdType = HasPropertiesType<SerializableItemId>({
  id: StringType,
  source: EnumType(SourceType),
});

export const SERIALIZABLE_ITEM_ID_CONVERTER = {
  convertBackward(serializable: Serializable): Result<SerializableItemId> {
    if (!SerializableItemIdType.check(serializable)) {
      return {success: false};
    }

    return {success: true, result: serializable};
  },

  convertForward(value: SerializableItemId): Result<Serializable> {
    return {success: true, result: {...value} as any};
  },
};
