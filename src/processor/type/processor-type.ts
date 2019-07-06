import { ArrayType } from './array-type';
import { FileType } from './file-type';

interface Type<T> {
  type: T;
}

export type ProcessorType = Type<'unknown'>|Type<'boolean'>|Type<'number'>|Type<'string'>|
    FileType|ArrayType<any>;
