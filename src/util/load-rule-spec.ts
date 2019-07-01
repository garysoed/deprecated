import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

import { fromEventPattern, Observable } from '@rxjs';
import { map } from '@rxjs/operators';

import { TYPE as CONFIG_SPEC_TYPE } from '../types/config-spec';
import { RuleSpec } from '../types/rule-spec';
import { Target } from '../types/target';

export const CONFIG_NAME = 'thoth.yml';

export function loadRuleSpec({dir, rule}: Target): Observable<RuleSpec|null> {
  return fromEventPattern<string>(
      handler => {
        const fileName = path.join(dir, CONFIG_NAME);
        fs.readFile(fileName, {encoding: 'utf8'}, (_err, data) => handler(data));
      },
  )
  .pipe(
      map(content => yaml.parse(content)),
      map(parsed => {
        if (!CONFIG_SPEC_TYPE.check(parsed)) {
          throw new Error('File is not a valid config file');
        }

        return parsed[rule] || null;
      }),
  );
}
