import { ProcessorInput } from './processor-input';
import { ProcessorType } from './processor-type';

export interface Processor<I extends ProcessorInput> {
  inputType: I;
  outputType: ProcessorType;

  run(inputs: {[K in keyof I]: any}): ProcessorType;
}

