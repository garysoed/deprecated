import { ArrayOfType, HasPropertiesType, IntersectType } from '@gs-types';
import { Result, Serializable } from '@nabu';
import { SerializableItem, SerializableItemType } from './serializable-item';
import { SerializableItemId, SerializableItemIdType } from './serializable-item-id';

export interface SerializableLocalFolder extends SerializableItem {
  contentIds: SerializableItemId[];
}

export const SerializableLocalFolderType = IntersectType<SerializableLocalFolder>([
  SerializableItemType,
  HasPropertiesType<{contentIds: SerializableItemId[]}>({
    contentIds: ArrayOfType(SerializableItemIdType),
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
