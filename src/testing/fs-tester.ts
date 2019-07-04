import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

export class FsTester {
  constructor(readonly root: string) { }

  async cleanup(): Promise<void> {
    await new Promise(resolve => {
      fs.rmdir(this.root, () => {
        resolve();
      });
    });
  }

  async createDir(dir: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.mkdir(path.join(this.root, dir), {recursive: true}, err => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }

  async createFile(filename: string, content: string = ''): Promise<void> {
    await this.createDir(path.dirname(filename));
    return new Promise((resolve, reject) => {
      fs.writeFile(path.join(this.root, filename), content, {encoding: 'utf8'}, err => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }
}

export async function newTester(): Promise<FsTester> {
  const testFolder = await new Promise<string>((resolve, reject) => {
    fs.mkdtemp(`/tmp${path.sep}`, (err, created) => {
      if (err) {
        reject(err);
      } else {
        resolve(created);
      }
    });
  });

  return new FsTester(testFolder);
}
