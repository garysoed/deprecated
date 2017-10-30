import { File, Folder } from '../data/interfaces';
import { ItemImpl } from '../data/item-impl';

export abstract class FileImpl extends ItemImpl implements File {
  constructor(
      readonly content: string,
      id: string,
      name: string,
      parent: Folder | null,
      path: string) {
    super(id, name, parent, path);
  }
}
