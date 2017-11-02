import { File } from '../data/interfaces';
import { ItemImpl } from '../data/item-impl';

export abstract class FileImpl extends ItemImpl implements File {
  constructor(
      readonly content: string,
      id: string,
      name: string,
      parentId: string | null,
      path: string) {
    super(id, name, parentId, path);
  }
}
