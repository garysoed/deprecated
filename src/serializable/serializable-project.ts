import { HasPropertiesType, StringType } from '@gs-types';
import { Result, Serializable } from '@nabu';

export interface SerializableProject {
  readonly id: string;
  readonly name: string;
  readonly rootFolderId: string;
}

export const SerializableProjectType = HasPropertiesType<SerializableProject>({
  id: StringType,
  name: StringType,
  rootFolderId: StringType,
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
