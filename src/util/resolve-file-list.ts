import { Observable, of as observableOf } from '@rxjs';

import { Glob } from '../types/yaml/glob';

export function resolveFileList(spec: Glob|string|string[], dir: string): Observable<string[]> {
  if (spec instanceof Glob) {
    return spec.resolveFiles(dir);
  } else if (typeof spec === 'string') {
    return observableOf([spec]);
  } else {
    return observableOf(spec);
  }
}
