import * as marked from 'marked';

import { Observable, of as observableOf } from '@rxjs';

import { newFileType as fileType } from '../type/file-type';


export const markdown = {
  inputType: {
    file: fileType('text/markdown'),
  },
  outputType: fileType('text/html'),
  run(inputs: {file: string}): Observable<string> {
    return observableOf(marked(inputs.file, {headerIds: true}));
  },
};
