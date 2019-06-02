import { BooleanType, EnumType, HasPropertiesType, StringType } from '@gs-types';
import { Result, Serializable, SerializableObject } from '@nabu';
import { ItemType } from '../datamodel/item-type';
import { BaseItemId, ItemIdType } from './item-id';

export interface SerializableItem extends SerializableObject {
  readonly id: BaseItemId;
  readonly isEditable: boolean;
  name: string;
  readonly type: ItemType;
}

export const SerializableItemType = HasPropertiesType<SerializableItem>({
  id: ItemIdType,
  isEditable: BooleanType,
  name: StringType,
  type: EnumType(ItemType),
});

export const SERIALIZABLE_ITEM_CONVERTER = {
  convertBackward(serializable: Serializable): Result<SerializableItem> {
    if (!SerializableItemType.check(serializable)) {
      return {success: false};
    }

    return {success: true, result: serializable};
  },

  convertForward(value: SerializableItem): Result<Serializable> {
    return {success: true, result: {...value}};
  },
};
