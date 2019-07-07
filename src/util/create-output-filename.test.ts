import { assert, should, test } from '@gs-testing';

import { createOutputFilename } from './create-output-filename';

test('@thoth/util/create-output-filename', () => {
  should(`generate the filename correctly`, () => {
    const spec = new Map([['a', '1'], ['b', '2'], ['c', '3']]);
    assert(createOutputFilename('[a]-[c]-[b]-abc.txt', spec)).to.equal('1-3-2-abc.txt');
  });
});
