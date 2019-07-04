import { assert, should, test } from '@gs-testing';

import { isAssignableTo, newFileType as fileType } from './file-type';


test('@thoth/types/processor/file-type', () => {
  test('isAssignableTo', () => {
    should(`return true if both type and subtype match`, () => {
      assert(isAssignableTo(fileType('text/plain'), fileType('text/plain'))).to.beTrue();
    });

    should(`return false if the subtypes don't match`, () => {
      assert(isAssignableTo(fileType('text/plain'), fileType('text/html'))).to.beFalse();
    });

    should(`return true if the other's subtype is *`, () => {
      assert(isAssignableTo(fileType('text/plain'), fileType('text/*'))).to.beTrue();
    });

    should(`return false if the types don't match`, () => {
      assert(isAssignableTo(fileType('image/svg'), fileType('text/*'))).to.beFalse();
    });

    should(`return true if the other's type is *`, () => {
      assert(isAssignableTo(fileType('image/svg'), fileType('*/*'))).to.beTrue();
    });

    should(`return true if the only subtypes match`, () => {
      assert(isAssignableTo(fileType('image/svg'), fileType('*/svg'))).to.beTrue();
    });
  });
});
