import { FileImpl } from '../data/file-impl';

export class DriveFile extends FileImpl {
  getSearchIndex(): { name: string; } {
    return {name: this.name};
  }
}
