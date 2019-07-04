interface InputType {
  [key: string]: string;
}

export interface Processor<I extends InputType> {
  inputType: I;
  outputType: string;

  run(inputs: {[K in keyof I]: any}): string;
}

