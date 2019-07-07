import { assert, match, should, test } from '@gs-testing';
import { of as observableOf } from '@rxjs';

import { arrayType } from '../processor/type/array-type';
import { newFileType } from '../processor/type/file-type';

import { generateOutputSpecs } from './generate-output-specs';

test('@thoth/util/generate-output-specs', () => {
  should(`generate outputs correctly`, () => {
    const processor = {
      inputType: {
        a: newFileType('text/*'),
        b: arrayType(newFileType('text/*')),
        c: newFileType('text/*'),
      },
      run: () => observableOf<string>(),
    };
    const inputs = new Map([
      ['a', ['a1.txt', 'a2.txt']],
      ['b', ['b1.txt', 'b2.txt', 'b3.txt']],
      ['c', ['c1.txt']],
    ]);

    assert(generateOutputSpecs(processor, ['a'], inputs)).to.haveExactElements([
      match.anyMapThat<string, string>().haveExactElements(new Map([['a', 'a1.txt']])),
      match.anyMapThat<string, string>().haveExactElements(new Map([['a', 'a2.txt']])),
    ]);
  });

  should(`return one empty map if there are no inputs`, async () => {
    const processor = {
      inputType: {
        a: newFileType('text/*'),
        b: arrayType(newFileType('text/*')),
        c: newFileType('text/*'),
      },
      run: () => observableOf<string>(),
    };
    const inputs = new Map<string, string[]>();

    assert(generateOutputSpecs(processor, ['a'], inputs)).to.haveExactElements([
      match.anyMapThat<string, string>().beEmpty(),
    ]);
  });

  should(`return one empty map if processor has no inputs`, async () => {
    const processor = {
      inputType: {},
      run: () => observableOf<string>(),
    };
    const inputs = new Map<string, string[]>([
      ['a', ['a1.txt', 'a2.txt']],
      ['b', ['b1.txt', 'b2.txt', 'b3.txt']],
      ['c', ['c1.txt']],
    ]);

    assert(generateOutputSpecs(processor, ['a'], inputs)).to.haveExactElements([
      match.anyMapThat<string, string>().beEmpty(),
    ]);
  });

  should(`return one empty map if there are no onnest inputs`, () => {
    const processor = {
      inputType: {
        a: newFileType('text/*'),
        b: arrayType(newFileType('text/*')),
        c: newFileType('text/*'),
      },
      run: () => observableOf<string>(),
    };
    const inputs = new Map([
      ['a', ['a1.txt', 'a2.txt']],
      ['b', ['b1.txt', 'b2.txt', 'b3.txt']],
      ['c', ['c1.txt']],
    ]);

    assert(generateOutputSpecs(processor, [], inputs)).to.haveExactElements([
      match.anyMapThat<string, string>().beEmpty(),
    ]);
  });
});
