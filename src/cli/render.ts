import chalk from 'chalk';
import * as commandLineArgs from 'command-line-args';
import { resolveRenderSpec } from 'src/util/resolve-render-spec';

import { assertNonNull } from '@gs-tools/rxjs';
import { Observable, of as observableOf, throwError } from '@rxjs';
import { map, switchMap } from '@rxjs/operators';

import { CommandType } from '../types/command-type';
import { TYPE as RENDER_TYPE } from '../types/render-spec';
import { Target } from '../types/target';
import { findProjectRoot } from '../util/find-project-root';
import { loadRuleSpec } from '../util/load-rule-spec';
import { parseTarget } from '../util/parse-target';


enum Options {
  DRY_RUN = 'dry-run',
  TARGET = 'target',
}

const optionList = [
  {
    name: Options.DRY_RUN,
    alias: 'd',
    description: 'Dry run',
    type: Boolean,
    defaultValue: false,
  },
  {
    name: Options.TARGET,
    alias: 't',
    description: 'Render target to run',
    type: parseTarget,
    typeLabel: '{underline target}',
    defaultOption: true,
  },
];

export const CLI = {
  title: 'Thoth: Render',
  body: () => ({
    header: 'Options',
    optionList,
  }),
  summary: 'Runs a rendering rule.',
  synopsis: `$ thoth ${CommandType.RENDER} {underline target} [--${Options.DRY_RUN}]`,
};

export function render(argv: string[]): Observable<string> {
  const options = commandLineArgs(optionList, {argv});
  const target = options[Options.TARGET] as Target;
  if (!target) {
    throw new Error('Target not specified');
  }

  const rule$ = findProjectRoot()
      .pipe(
          assertNonNull(`Cannot find project root`),
          switchMap(root => loadRuleSpec(target, root).pipe(
              assertNonNull(chalk`Rule {underline ${target.rule}} cannot be found`),
              map(spec => ({spec, root})),
          )),
          switchMap(({root, spec}) => {
            if (!RENDER_TYPE.check(spec)) {
              return throwError(new Error(
                  chalk`Target {underline ${target.dir}:${target.rule}} is not a render target`));
            }

            return resolveRenderSpec(spec, target.dir, target.rule, root);
          }),
      )
  ;

  const processor$ = rule$.pipe(
      map(rule => rule.processor),
  );

  return observableOf();
}
