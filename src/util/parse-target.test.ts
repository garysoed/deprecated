import { assert, match, should, test } from '@gs-testing';

import { parseTarget } from './parse-target';

test('@thoth/util/parse-target', () => {
  should(`return the correct target`, () => {
    const dir = 'dir';
    const rule = 'rule';

    assert(parseTarget(`${dir}:${rule}`)).to.equal(match.anyObjectThat().haveProperties({
      dir,
      rule,
    }));
  });

  should(`throw error if invalid`, () => {
    assert(() => parseTarget('blah')).to.throwErrorWithMessage(/is invalid/);
  });
});
