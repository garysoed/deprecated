import { HasPropertiesType, IterableOfType, StringType } from 'gs-types/export';

export interface SerializableProject {
  readonly id: string;
  readonly name: string;
  readonly rootFolderIds: string[];
}

export const SerializableProjectType = HasPropertiesType<SerializableProject>({
  id: StringType,
  name: StringType,
  rootFolderIds: IterableOfType(StringType),
});
