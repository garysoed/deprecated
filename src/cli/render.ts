import chalk from 'chalk';
import * as commandLineArgs from 'command-line-args';

import { assertNonNull } from '@gs-tools/rxjs';
import { combineLatest, Observable, of as observableOf, throwError } from '@rxjs';
import { map, share, switchMap } from '@rxjs/operators';

import { ProcessorInput } from '../processor/type/processor-input';
import { CommandType } from '../types/command-type';
import { TYPE as RENDER_TYPE } from '../types/render-spec';
import { Target } from '../types/target';
import { createOutputFilename } from '../util/create-output-filename';
import { findProjectRoot } from '../util/find-project-root';
import { generateOutputSpecs } from '../util/generate-output-specs';
import { loadRuleSpec } from '../util/load-rule-spec';
import { parseTarget } from '../util/parse-target';
import { resolveRenderSpec } from '../util/resolve-render-spec';

interface RunSpec {
  filename: string;
  inputFilenames: Map<string, string|string[]>;
}

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

  const outputs$ = findProjectRoot()
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

          map(rule => {
            const outputSpecs = generateOutputSpecs(rule.processor, rule.unnestInputs, rule.inputs);
            const runSpec: RunSpec[] = outputSpecs.map(spec => {
              const filename = createOutputFilename(rule.outputTemplate, spec);
              const unnestKeys = new Set(spec.keys());

              // Generate the inputs. First, add the unnest keys.
              const inputFilenames = new Map<string, string|string[]>();
              for (const [key, filename] of spec) {
                inputFilenames.set(key, filename);
              }

              // Now add the rest of the inputs.
              for (const [key, filenames] of rule.inputs) {
                if (unnestKeys.has(key)) {
                  continue;
                }

                inputFilenames.set(key, filenames);
              }

              return {filename, inputFilenames};
            });

            return runSpec;
          }),
      );

  // TODO: Print dryrunmessage.
  // TODO: Run dependencies.
  // TODO: Load / copy the input files
  // TODO: Run processor
  // TODO: Write outputs

  return observableOf();
}
