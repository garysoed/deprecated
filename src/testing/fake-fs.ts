import * as fs from 'fs';

import { fake, spy } from '@gs-testing';
import { MapSubject, scanMap } from '@gs-tools/rxjs';
import { take } from '@rxjs/operators';

const files$ = new MapSubject<fs.PathLike, {}>();

type AccessHandler = (err: NodeJS.ErrnoException|null) => void;
function mockAccess(path: fs.PathLike, callback: AccessHandler): void;
function mockAccess(
    path: fs.PathLike,
    mode: number|undefined,
    callback: AccessHandler,
): void;
function mockAccess(
    path: fs.PathLike,
    modeOrCallback: number|AccessHandler|undefined,
    callback?: AccessHandler): void {
  const normalizedCallback = callback || (modeOrCallback as AccessHandler);
  files$
      .pipe(
          scanMap(),
          take(1),
      )
      .subscribe(map => {
        if (map.get(path)) {
          normalizedCallback(null);
          return;
        }

        normalizedCallback(new Error(`File ${path} not found`));
      });
}

export function addFile(path: fs.PathLike): void {
  files$.set(path, {});
}

export function deleteFile(path: fs.PathLike): void {
  files$.delete(path);
}

export function mockFs(): void {
  files$.next({type: 'init', value: new Map()});
  fake(spy(fs, 'access')).always().call(mockAccess);
}
