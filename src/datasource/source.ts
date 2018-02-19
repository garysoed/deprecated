import { DataModel } from 'external/gs_tools/src/datamodel';

export abstract class Source implements DataModel<string> {
  abstract getSearchIndex(): string;
}
