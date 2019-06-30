import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';

import { fromEventPattern, Observable, of as observableOf } from '@rxjs';
import { filter, map, startWith, switchMap, take, takeLast } from '@rxjs/operators';

import { FILE_NAME } from '../types/project-config';

export function findProjectRoot(): Observable<string|null> {
  // Generate the paths to the root.
  let curr = process.cwd();
  const dirs: string[] = [curr];
  while (path.parse(curr).root !== curr) {
    curr = path.join(curr, '..');
    dirs.push(curr);
  }

  return observableOf(...dirs)
      .pipe(
          switchMap(dir => hasProjectConfig(dir).pipe(map(has => has ? dir : null))),
          filter(dir => !!dir),
          take(1),
          startWith(null),
          takeLast(1),
      );
}

// TODO: Add file watcher.
function hasProjectConfig(dir: string): Observable<boolean> {
  return fromEventPattern(
      handler => fs.access(path.join(dir, FILE_NAME), fs.constants.R_OK, err => handler(err)),
  )
  .pipe(
      map(err => !err),
      take(1),
  );
}
