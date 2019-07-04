import { assert, createSpyInstance, fake, should, test } from '@gs-testing';
import { of as observableOf } from '@rxjs';
import { switchMap } from '@rxjs/operators';

import { Glob } from '../types/yaml/glob';

import { resolveFileList } from './resolve-file-list';

test('@thoth/util/resolve-file-list', () => {
  should(`handle globs`, () => {
    const dir = 'dir';
    const file1 = 'file1';
    const file2 = 'file2';
    const file3 = 'file3';
    const mockGlob = createSpyInstance(Glob);
    fake(mockGlob.resolveFiles).always().return(observableOf([file1, file2, file3]));

    assert(resolveFileList(mockGlob, dir).pipe(switchMap(files => observableOf(...files))))
        .to.emitSequence([file1, file2, file3]);
    assert(mockGlob.resolveFiles).to.haveBeenCalledWith(dir);
  });

  should(`handle array of file names`, () => {
    const file1 = 'file1';
    const file2 = 'file2';
    const file3 = 'file3';

    const files$ = resolveFileList([file1, file2, file3], 'dir')
        .pipe(switchMap(files => observableOf(...files)));
    assert(files$).to.emitSequence([file1, file2, file3]);
  });

  should(`a single file name`, () => {
    const file = 'file';

    const files$ = resolveFileList(file, 'dir')
        .pipe(switchMap(files => observableOf(...files)));
    assert(files$).to.emitSequence([file]);
  });
});
