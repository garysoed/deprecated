import { ArrayType } from '../type/array-type';
import { FileType } from '../type/file-type';
import { ProcessorType } from '../type/processor-type';

export enum AssignableState {
  ASSIGNABLE,
  ASSIGNABLE_WITH_UNNEST,
  UNASSIGNABLE,
}

export function isAssignableTo(from: ProcessorType, to: ProcessorType): AssignableState {
  if (to instanceof ArrayType) {
    if (!(from instanceof ArrayType)) {
      return AssignableState.UNASSIGNABLE;
    }

    return isAssignableTo(from.innerType, to.innerType);
  } else if (to instanceof FileType) {
    if (from instanceof ArrayType) {
      return isAssignableTo(from.innerType, to) === AssignableState.ASSIGNABLE ?
          AssignableState.ASSIGNABLE_WITH_UNNEST :
          AssignableState.UNASSIGNABLE;
    }

    if (!(from instanceof FileType)) {
      return AssignableState.UNASSIGNABLE;
    }

    return isFileTypeAssignableTo(from, to);
  } else if (to.type === 'string') {
    if (from instanceof ArrayType) {
      return isAssignableTo(from.innerType, to) === AssignableState.ASSIGNABLE ?
          AssignableState.ASSIGNABLE_WITH_UNNEST :
          AssignableState.UNASSIGNABLE;
    }

    return from.type === 'string' ? AssignableState.ASSIGNABLE : AssignableState.UNASSIGNABLE;
  } else if (to.type === 'number') {
    if (from instanceof ArrayType) {
      return isAssignableTo(from.innerType, to) === AssignableState.ASSIGNABLE ?
          AssignableState.ASSIGNABLE_WITH_UNNEST :
          AssignableState.UNASSIGNABLE;
    }

    return from.type === 'number' ? AssignableState.ASSIGNABLE : AssignableState.UNASSIGNABLE;
  } else {
    if (from instanceof ArrayType) {
      return isAssignableTo(from.innerType, to) === AssignableState.ASSIGNABLE ?
          AssignableState.ASSIGNABLE_WITH_UNNEST :
          AssignableState.UNASSIGNABLE;
    }

    return from.type === 'boolean' ? AssignableState.ASSIGNABLE : AssignableState.UNASSIGNABLE;
  }
}

function isFileTypeAssignableTo(from: FileType, to: FileType): AssignableState {
  if (to.type !== '*' && to.type !== from.type) {
    return AssignableState.UNASSIGNABLE;
  }

  if (to.subtype === '*') {
    return AssignableState.ASSIGNABLE;
  }

  return to.subtype === from.subtype ? AssignableState.ASSIGNABLE : AssignableState.UNASSIGNABLE;
}
