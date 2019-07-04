import { assert, should, test } from '@gs-testing';

import { arrayType } from './array-type';
import { newFileType as fileType } from './file-type';
import { AssignableState, isAssignableTo } from './is-assignable-to';


test('@thoth/processor/type/is-assignable-to', () => {
  test('isAssignableTo', () => {
    should(`return ASSIGNABLE if 'to' and 'from' are booleans`, () => {
      assert(isAssignableTo({type: 'boolean'}, {type: 'boolean'})).to
          .equal(AssignableState.ASSIGNABLE);
    });

    should(`return UNASSIGNABLE if 'to' is boolean and 'from' is number`, () => {
      assert(isAssignableTo({type: 'number'}, {type: 'boolean'})).to
          .equal(AssignableState.UNASSIGNABLE);
    });

    should(
        `return ASSIGNABLE_WITH_UNNEST if 'to' is boolean and 'from' is boolean array`,
        () => {
          assert(isAssignableTo(arrayType({type: 'boolean'}), {type: 'boolean'})).to
              .equal(AssignableState.ASSIGNABLE_WITH_UNNEST);
        });

    should(`return UNASSIGNABLE if 'to' is boolean from 'from' is number array`, () => {
      assert(isAssignableTo(arrayType({type: 'number'}), {type: 'boolean'})).to
          .equal(AssignableState.UNASSIGNABLE);
    });

    should(`return ASSIGNABLE if 'to' and 'from' are numbers`, () => {
      assert(isAssignableTo({type: 'number'}, {type: 'number'})).to
          .equal(AssignableState.ASSIGNABLE);
    });

    should(`return UNASSIGNABLE if 'to' is number and 'from' is string`, () => {
      assert(isAssignableTo({type: 'string'}, {type: 'number'})).to
          .equal(AssignableState.UNASSIGNABLE);
    });

    should(
        `return ASSIGNABLE_WITH_UNNEST if 'to' is number and 'from' is number array`,
        () => {
          assert(isAssignableTo(arrayType({type: 'number'}), {type: 'number'})).to
              .equal(AssignableState.ASSIGNABLE_WITH_UNNEST);
        });

    should(`return UNASSIGNABLE if 'to' is number from 'from' is string array`, () => {
      assert(isAssignableTo(arrayType({type: 'string'}), {type: 'number'})).to
          .equal(AssignableState.UNASSIGNABLE);
    });

    should(`return ASSIGNABLE if 'to' and 'from' are strings`, () => {
      assert(isAssignableTo({type: 'string'}, {type: 'string'})).to
          .equal(AssignableState.ASSIGNABLE);
    });

    should(`return UNASSIGNABLE if 'to' is string and 'from' is File`, () => {
      assert(isAssignableTo(fileType('text/html'), {type: 'string'})).to
          .equal(AssignableState.UNASSIGNABLE);
    });

    should(
        `return ASSIGNABLE_WITH_UNNEST if 'to' is string and 'from' is string array`,
        () => {
          assert(isAssignableTo(arrayType({type: 'string'}), {type: 'string'})).to
              .equal(AssignableState.ASSIGNABLE_WITH_UNNEST);
        });

    should(`return UNASSIGNABLE if 'to' is string from 'from' is File array`, () => {
      assert(isAssignableTo(arrayType(fileType('text/plain')), {type: 'string'})).to
          .equal(AssignableState.UNASSIGNABLE);
    });

    should(`return ASSIGNABLE if 'to' and 'from' are compatible Files`, () => {
      assert(isAssignableTo(fileType('text/plain'), fileType('text/*'))).to
          .equal(AssignableState.ASSIGNABLE);
    });

    should(`return UNASSIGNABLE if 'to' is File and 'from' is boolean`, () => {
      assert(isAssignableTo({type: 'boolean'}, fileType('text/*'))).to
          .equal(AssignableState.UNASSIGNABLE);
    });

    should(`return ASSIGNABLE_WITH_UNNEST if 'to' is File and 'from' is File array`, () => {
      assert(isAssignableTo(arrayType(fileType('text/html')), fileType('text/*'))).to
          .equal(AssignableState.ASSIGNABLE_WITH_UNNEST);
    });

    should(`return UNASSIGNABLE if 'to' is File from 'from' is boolean array`, () => {
      assert(isAssignableTo(arrayType({type: 'boolean'}), fileType('text/*'))).to
          .equal(AssignableState.UNASSIGNABLE);
    });

    should(`return ASSIGNABLE if 'to' and 'from' are compatible arrays`, () => {
      assert(isAssignableTo(arrayType({type: 'boolean'}), arrayType({type: 'boolean'}))).to
          .equal(AssignableState.ASSIGNABLE);
    });

    should(`return UNASSIGNABLE if 'to' is string array and 'from' is boolean array`, () => {
      assert(isAssignableTo(arrayType({type: 'boolean'}), arrayType({type: 'string'}))).to
          .equal(AssignableState.UNASSIGNABLE);
    });

    should(
        `return ASSIGNABLE_WITH_UNNEST if 'to' is string[] and 'from' is string[][]`,
        () => {
          const fromType = arrayType(arrayType({type: 'string'}));
          const toType = arrayType({type: 'string'});
          assert(isAssignableTo(fromType, toType)).to.equal(AssignableState.ASSIGNABLE_WITH_UNNEST);
        });

    should(`return UNASSIGNABLE if 'to' is array from 'from' is not an array`, () => {
      assert(isAssignableTo({type: 'string'}, arrayType({type: 'string'}))).to
          .equal(AssignableState.UNASSIGNABLE);
    });

    should(`return UNASSIGNABLE if 'to' is string[] and 'from' is string[][]`, () => {
      const fromType = arrayType({type: 'string'});
      const toType = arrayType(arrayType({type: 'string'}));
      assert(isAssignableTo(fromType, toType)).to.equal(AssignableState.UNASSIGNABLE);
    });
  });

  test('isFileTypeAssignableTo', () => {
    should(`return ASSIGNABLE if both type and subtype match`, () => {
      assert(isAssignableTo(fileType('text/plain'), fileType('text/plain'))).to
          .equal(AssignableState.ASSIGNABLE);
    });

    should(`return UNASSIGNABLE if the subtypes don't match`, () => {
      assert(isAssignableTo(fileType('text/plain'), fileType('text/html'))).to
          .equal(AssignableState.UNASSIGNABLE);
    });

    should(`return ASSIGNABLE if the other's subtype is *`, () => {
      assert(isAssignableTo(fileType('text/plain'), fileType('text/*'))).to
          .equal(AssignableState.ASSIGNABLE);
    });

    should(`return UNASSIGNABLE if the types don't match`, () => {
      assert(isAssignableTo(fileType('image/svg'), fileType('text/*'))).to
          .equal(AssignableState.UNASSIGNABLE);
    });

    should(`return ASSIGNABLE if the other's type is *`, () => {
      assert(isAssignableTo(fileType('image/svg'), fileType('*/*'))).to
          .equal(AssignableState.ASSIGNABLE);
    });

    should(`return ASSIGNABLE if the only subtypes match`, () => {
      assert(isAssignableTo(fileType('image/svg'), fileType('*/svg'))).to
          .equal(AssignableState.ASSIGNABLE);
    });
  });
});
