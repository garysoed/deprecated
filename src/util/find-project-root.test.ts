import * as path from 'path';

import { assert, setup, should, test } from '@gs-testing';

import { addFile, mockFs } from '../testing/fake-fs';
import { mockProcess, setCwd } from '../testing/fake-process';
import { FILE_NAME } from '../types/project-config';

import { findProjectRoot } from './find-project-root';

test('@thoth/util/find-project-root', () => {
  setup(() => {
    mockFs();
    mockProcess();
  });

  should(`return the correct project root`, () => {
    setCwd('/a/cwd');

    addFile(path.join('/a', FILE_NAME));

    assert(findProjectRoot()).to.emitSequence(['/a']);
  });

  should(`handle current directory`, () => {
    setCwd('/a');

    addFile(path.join('/a', FILE_NAME));

    assert(findProjectRoot()).to.emitSequence(['/a']);
  });

  should(`return the inner project root if two exists`, () => {
    setCwd('/a/cwd');

    addFile(path.join('/a/cwd', FILE_NAME));
    addFile(path.join('/a', FILE_NAME));

    assert(findProjectRoot()).to.emitSequence(['/a/cwd']);
  });

  should(`return null if there are no project roots`, () => {
    setCwd('/a/cwd');

    assert(findProjectRoot()).to.emitSequence([null]);
  });
});
