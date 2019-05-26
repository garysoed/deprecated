import { BooleanType, EnumType, HasPropertiesType, StringType } from '@gs-types';
import { Result, Serializable } from '@nabu';
import { ItemType } from '../datamodel/item-type';
import { SerializableItemId, SerializableItemIdType } from './serializable-item-id';

export interface SerializableItem {
  readonly id: SerializableItemId;
  readonly isEditable: boolean;
  readonly name: string;
  readonly type: ItemType;
}

export const SerializableItemType = HasPropertiesType<SerializableItem>({
  id: SerializableItemIdType,
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
