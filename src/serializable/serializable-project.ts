import { HasPropertiesType, StringType } from '@gs-types';
import { Result, Serializable, SerializableObject } from '@nabu';
import { SerializableItemId, SerializableItemIdType } from './serializable-item-id';

export interface SerializableProject extends SerializableObject {
  readonly id: string;
  name: string;
  readonly rootFolderId: SerializableItemId;
}

export const SerializableProjectType = HasPropertiesType<SerializableProject>({
  id: StringType,
  name: StringType,
  rootFolderId: SerializableItemIdType,
});

export const SERIALIZABLE_PROJECT_CONVERTER = {
  convertBackward(serializable: Serializable): Result<SerializableProject> {
    if (!SerializableProjectType.check(serializable)) {
      return {success: false};
    }

    return {success: true, result: serializable};
  },

  convertForward(value: SerializableProject): Result<Serializable> {
    return {success: true, result: {...value}};
  },
};
