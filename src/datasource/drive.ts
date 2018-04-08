import { Source } from '../datasource/source';

export enum ApiFileType {
  UNKNOWN,
  TSV,
  FOLDER,
  MARKDOWN,
  METADATA,
  PROCESSOR,
}

export type ApiFileSummary<S extends Source> = {
  name: string,
  source: S,
  type: ApiFileType,
};

export type ApiFile<S extends Source> = {
  content?: string,
  files: ApiFile<S>[],
  summary: ApiFileSummary<S>,
};
