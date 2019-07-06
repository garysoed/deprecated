import * as mimeTypes from 'mime-types';

import { arrayType } from '../processor/type/array-type';
import { newFileType } from '../processor/type/file-type';
import { ProcessorType } from '../processor/type/processor-type';
import { AssignableState, isAssignableTo } from '../processor/util/is-assignable-to';


export function getProcessorType(filenames: string[]): ProcessorType {
  if (filenames.length === 0) {
    return {type: 'unknown'};
  } else if (filenames.length === 1) {
    const value = filenames[0];
    return newFileType(mimeTypes.lookup(value) || '*/*');
  } else {
    const firstType = getProcessorType([filenames[0]]);
    const [, ...rest] = filenames;

    // Make sure that the rest of the items have compatible types.
    for (const item of rest) {
      const itemType = getProcessorType([item]);
      if (isAssignableTo(itemType, firstType) !== AssignableState.ASSIGNABLE ||
          isAssignableTo(firstType, itemType) !== AssignableState.ASSIGNABLE) {
        return arrayType({type: 'unknown'});
      }
    }

    return arrayType(firstType);
  }
}
