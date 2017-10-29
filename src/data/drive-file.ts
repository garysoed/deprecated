import { File } from '../data/file';

export class DriveFile extends File {
  getSearchIndex(): { name: string; } {
    return {name: this.name};
  }
}
