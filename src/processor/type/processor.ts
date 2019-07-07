import { Observable } from '@rxjs';

import { ProcessorInput } from './processor-input';

export interface Processor<I extends ProcessorInput = ProcessorInput> {
  inputType: I;

  run(inputs: {[K in keyof I]: any}): Observable<string>;
}

