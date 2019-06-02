import { ArrayOfType, HasPropertiesType, IntersectType } from '@gs-types';
import { Result, Serializable } from '@nabu';
import { BaseItemId, ItemIdType, LocalItemId } from './item-id';
import { SerializableItem, SerializableItemType } from './serializable-item';

export interface SerializableLocalFolder extends SerializableItem {
  contentIds: BaseItemId[];
  id: LocalItemId;
}

export const SerializableLocalFolderType = IntersectType<SerializableLocalFolder>([
  SerializableItemType,
  HasPropertiesType<{contentIds: BaseItemId[]}>({
    contentIds: ArrayOfType(ItemIdType),
  }),
]);

export const SERIALIZABLE_LOCAL_FOLDER_CONVERTER = {
  convertBackward(serializable: Serializable): Result<SerializableLocalFolder> {
    if (!SerializableLocalFolderType.check(serializable)) {
      return {success: false};
    }

    return {success: true, result: serializable};
  },

  convertForward(value: SerializableLocalFolder): Result<Serializable> {
    return {success: true, result: {...value} as any};
  },
};
