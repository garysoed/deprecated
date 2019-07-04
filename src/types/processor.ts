import { ProcessorInput } from '../util/processor-input';

export interface Processor<I extends ProcessorInput> {
  inputType: I;
  outputType: string;

  run(inputs: {[K in keyof I]: any}): string;
}

