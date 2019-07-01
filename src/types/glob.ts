import * as glob from 'glob';
import * as yaml from 'yaml';

import { fromEventPattern, Observable, of as observableOf } from '@rxjs';
import { switchMap, take } from '@rxjs/operators';

export class Glob {
  constructor(private readonly expr: string) { }

  /**
   * Emits files that matches the query on the root, then completes.
   */
  resolveFiles(root: string): Observable<string[]> {
    return fromEventPattern<string[]>(
        handler => {
          glob(this.expr, {root}, (err, matches) => {
            if (err) {
              throw err;
            }
            handler(matches);
          });
        },
    )
    .pipe(take(1));
  }
}

export const TAG = {
  tag: '!glob',
  resolve: (doc: yaml.ast.Document, cst: yaml.cst.Node) => {
    return new Glob((cst as any).strValue);
  },
  stringify: (item: yaml.ast.Node) => item.tag || '',
};
