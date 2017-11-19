import { Serializable } from 'external/gs_tools/src/data';
import { DataModel, DataModels, field } from 'external/gs_tools/src/datamodel';
import { ImmutableMap } from 'external/gs_tools/src/immutable';
import { StringParser } from 'external/gs_tools/src/parse';

@Serializable('data.PreviewFile')
export abstract class PreviewFile implements DataModel<{ id: string }> {
  @field('content', StringParser) readonly content_: string;
  @field('id', StringParser) readonly id_: string;

  abstract getContent(): string;

  abstract getId(): string;

  getSearchIndex(): {id: string} {
    return {id: this.id_};
  }

  toString(): string {
    return `PreviewFile(${this.id_})`;
  }

  static newInstance(id: string, content: string): PreviewFile {
    return DataModels.newInstance(
        PreviewFile,
        ImmutableMap.of([
          ['id_', id],
          ['content_', content],
        ]));
  }
}
