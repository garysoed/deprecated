import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';

import { FILE_NAME } from '../types/project-config';

export async function findProjectRoot(): Promise<string|null> {
  // Generate the paths to the root.
  let curr = process.cwd();
  const dirs: string[] = [curr];
  do {
    curr = path.resolve('..', curr);
    dirs.push(curr);
  } while (!path.parse(curr).root);

  for (const dir of dirs) {
    if (await hasProjectConfig(dir)) {
      return dir;
    }
  }

  return null;
}

async function hasProjectConfig(dir: string): Promise<boolean> {
  return new Promise(resolve => {
    fs.access(path.join(dir, FILE_NAME), fs.constants.R_OK, err => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}
