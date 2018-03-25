import { Source } from '../datasource/source';

export enum ApiFileType {
  UNKNOWN,
  FOLDER,
  MARKDOWN,
  METADATA,
}

// TODO: source should be generic type.
export type ApiFileSummary<S extends Source> = {
  name: string,
  source: S,
  type: ApiFileType,
};

// TODO: should have generic type of source.
export type ApiFile<S extends Source> = {
  content?: string,
  files: ApiFile<S>[],
  summary: ApiFileSummary<S>,
};
