import * as marked from 'marked';

import { newFileType as fileType } from '../type/file-type';


export const markdown = {
  inputType: {
    file: fileType('text/markdown'),
  },
  outputType: fileType('text/html'),
  run(inputs: {file: string}): string {
    return marked(inputs.file, {headerIds: true});
  },
};
