import { BooleanType, EnumType, HasPropertiesType, StringType } from '@gs-types';
import { Result, Serializable } from '@nabu';
import { ItemType } from '../datamodel/item-type';
import { SerializableSource, SerializableSourceType } from './serializable-source';

export type SerializableItemMetadata = {
  readonly id: string;
  readonly isEditable: boolean;
  readonly name: string;
  readonly source: SerializableSource;
  readonly type: ItemType;
};

export const SerializableItemMetadataType = HasPropertiesType<SerializableItemMetadata>({
  id: StringType,
  isEditable: BooleanType,
  name: StringType,
  source: SerializableSourceType,
  type: EnumType(ItemType),
});

export const SERIALIZABLE_ITEM_METADATA_CONVERTER = {
  convertBackward(serializable: Serializable): Result<SerializableItemMetadata> {
    if (!SerializableItemMetadataType.check(serializable)) {
      return {success: false};
    }

    return {success: true, result: serializable};
  },

  convertForward(value: SerializableItemMetadata): Result<Serializable> {
    return {success: true, result: {...value} as any};
  },
};
