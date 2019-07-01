import * as fs from 'fs';

import { fake, spy } from '@gs-testing';
import { MapSubject, scanMap } from '@gs-tools/rxjs';
import { take } from '@rxjs/operators';

interface FakeFile {
  content: string;
}

const files$ = new MapSubject<fs.PathLike, FakeFile>();

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

type ReadFileHandler = (err: NodeJS.ErrnoException | null, data: Buffer) => void;
function mockReadFile(
    path: fs.PathLike|number,
    options: {}|undefined|null,
    callback: ReadFileHandler,
): void;
function mockReadFile(
    path: fs.PathLike|number,
    callback: ReadFileHandler,
): void;
function mockReadFile(
    path: fs.PathLike|number,
    optionsOrCallback: ReadFileHandler|{}|undefined|null,
    callback?: ReadFileHandler,
): void {
  if (typeof path === 'number') {
    throw new Error('File descriptor not supported');
  }

  const normalizedCallback = callback || (optionsOrCallback as ReadFileHandler);
  files$
      .pipe(
          scanMap(),
          take(1),
      )
      .subscribe(map => {
        const file = map.get(path);
        if (file) {
          normalizedCallback(null, file.content as any);
          return;
        }

        normalizedCallback(new Error(`File ${path} not found`), null as any);
      });
}

export  function addFile(path: fs.PathLike, file: FakeFile): void {
  files$.set(path, file);
}

export function deleteFile(path: fs.PathLike): void {
  files$.delete(path);
}

export function mockFs(): void {
  files$.next({type: 'init', value: new Map()});
  fake(spy(fs, 'access')).always().call(mockAccess);
  fake(spy(fs, 'readFile')).always().call(mockReadFile);
}
