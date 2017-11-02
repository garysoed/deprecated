import { DataModel } from 'external/gs_tools/src/datamodel';
import { Item } from '../data/interfaces';

export abstract class ItemImpl implements DataModel<{ name: string }>, Item {

  constructor(
      readonly id: string,
      readonly name: string,
      readonly parentId: string | null,
      readonly path: string) { }

  abstract getSearchIndex(): {name: string};
}
