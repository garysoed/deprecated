import { Serializable } from 'external/gs_tools/src/data';
import { DataModel, DataModels, field } from 'external/gs_tools/src/datamodel';
import { ImmutableMap } from 'external/gs_tools/src/immutable';
import { StringParser } from 'external/gs_tools/src/parse';

@Serializable('data.Project')
export abstract class Project implements DataModel<string> {
  @field('rootFolderId', StringParser) rootFolderId_!: string;

  abstract getRootFolderId(): string;

  getSearchIndex(): '' {
    return '';
  }

  static newInstance(rootFolderId: string): Project {
    return DataModels.newInstance(
        Project,
        createImmutableMap([
          ['rootFolderId_', rootFolderId],
        ]));
  }
}
