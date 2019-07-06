import { assert, match, should, test } from '@gs-testing';

import { getProcessorType } from './get-processor-type';

test('@thoth/util/get-processor-type', () => {
  should(`return the correct array type`, () => {
    assert(getProcessorType(['file.txt', 'file2.txt'])).to.equal(
      match.anyObjectThat().haveProperties({
        innerType: match.anyObjectThat().haveProperties({
          type: 'text',
          subtype: 'plain',
        }),
      }),
    );
  });

  should(`return array of unknowns if two items in the array are not assignable`, () => {
    assert(getProcessorType(['file.txt', 'file2.md'])).to.equal(
      match.anyObjectThat().haveProperties({
        innerType: match.anyObjectThat().haveProperties({
          type: 'unknown',
        }),
      }),
    );
  });

  should(`return the correct mimetype if input is a single file name`, () => {
    assert(getProcessorType(['file.txt'])).to.equal(
      match.anyObjectThat().haveProperties({
        type: 'text',
        subtype: 'plain',
      }),
    );
  });

  should(`return */* mimetype if the file type is unknown`, () => {
    assert(getProcessorType(['build'])).to.equal(
      match.anyObjectThat().haveProperties({
        type: '*',
        subtype: '*',
      }),
    );
  });

  should(`return unknown type if empty`, () => {
    assert(getProcessorType([])).to.equal(
      match.anyObjectThat().haveProperties({
        type: 'unknown',
      }),
    );
  });
});
