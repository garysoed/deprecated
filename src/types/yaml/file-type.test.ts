import { assert, should, test } from '@gs-testing';

import { FileType } from './file-type';

test('@thoth/types/yaml/file-type', () => {
  test('isAssignableTo', () => {
    should(`return true if both type and subtype match`, () => {
      assert(new FileType('text/plain').isAssignableTo(new FileType('text/plain'))).to.beTrue();
    });

    should(`return false if the subtypes don't match`, () => {
      assert(new FileType('text/plain').isAssignableTo(new FileType('text/html'))).to.beFalse();
    });

    should(`return true if the other's subtype is *`, () => {
      assert(new FileType('text/plain').isAssignableTo(new FileType('text/*'))).to.beTrue();
    });

    should(`return false if the types don't match`, () => {
      assert(new FileType('image/svg').isAssignableTo(new FileType('text/*'))).to.beFalse();
    });

    should(`return true if the other's type is *`, () => {
      assert(new FileType('image/svg').isAssignableTo(new FileType('*/*'))).to.beTrue();
    });

    should(`return true if the only subtypes match`, () => {
      assert(new FileType('image/svg').isAssignableTo(new FileType('*/svg'))).to.beTrue();
    });
  });
});
