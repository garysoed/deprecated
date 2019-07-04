import { ProcessorType } from './processor-type';

export class ArrayType<T extends ProcessorType> {
  constructor(readonly innerType: T) { }
}

export function arrayType<T extends ProcessorType>(innerType: T): ArrayType<T> {
  return new ArrayType(innerType);
}
