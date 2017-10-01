import { DataModel } from 'external/gs_tools/src/datamodel';

export abstract class Item implements DataModel<{ name: string }> {
  readonly id: string;
  readonly name: string;
  readonly parent: Item | null;
  readonly path: string;

  abstract getSearchIndex(): {name: string};
}
