import { Serializable } from 'external/gs_tools/src/data';
import { DataModel, DataModels, field } from 'external/gs_tools/src/datamodel';
import { ImmutableMap } from 'external/gs_tools/src/immutable';
import { StringParser } from 'external/gs_tools/src/parse';

@Serializable('data.PreviewFile')
export abstract class PreviewFile implements DataModel<string> {
  @field('content', StringParser) readonly content_!: string;
  @field('path', StringParser) readonly path_!: string;

  abstract getContent(): string;

  getPath(): string {
    return this.path_;
  }

  getSearchIndex(): string {
    return this.path_;
  }

  toString(): string {
    return `PreviewFile(${this.path_})`;
  }

  static newInstance(path: string, content: string): PreviewFile {
    return DataModels.newInstance(
        PreviewFile,
        ImmutableMap.of([
          ['content_', content],
          ['path_', path],
        ]));
  }
}
