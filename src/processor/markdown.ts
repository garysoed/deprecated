import * as marked from 'marked';

import { Processor } from '../types/processor';

export const markdown: Processor<{file: string}> = {
  inputType: {
    file: 'text/markdown',
  },
  outputType: 'text/html',
  run(inputs: {file: string}): string {
    return marked(inputs.file, {headerIds: true});
  },
};
