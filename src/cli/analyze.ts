import chalk from 'chalk';
import * as commandLineArgs from 'command-line-args';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

import { formatMessage, MessageType } from '@gs-tools/cli';
import { assertNonNull } from '@gs-tools/rxjs';
import { combineLatest, concat, fromEventPattern, Observable, of as observableOf } from '@rxjs';
import { map, scan, switchMap, take, takeLast } from '@rxjs/operators';

import { CommandType } from '../types/command-type';
import { TYPE as CONFIG_SPEC_TYPE } from '../types/config-spec';
import { Glob } from '../types/glob';
import { RenderSpec, TYPE as RENDER_SPEC_TYPE } from '../types/render-spec';
import { RuleSpec } from '../types/rule-spec';
import { findProjectRoot } from '../util/find-project-root';

const CONFIG_NAME = 'thoth.yml';
const PAD = '  ';

enum Options {
  TARGET = 'target',
}
const OPTIONS = [
  {
    name: Options.TARGET,
    defaultOption: true,
  },
];
export const CLI = {
  title: 'Thoth: Analyze',
  body: () => ({}),
  summary: 'Analyzes the given rule file.',
  synopsis: `$ thoth ${CommandType.ANALYZE} {underline target}`,
};

export function analyze(argv: string[]): Observable<string> {
  const options = commandLineArgs(OPTIONS, {argv});

  const projectRoot$ = findProjectRoot().pipe(assertNonNull('Project root not found'));

  const target = options[Options.TARGET];
  if (typeof target !== 'string') {
    throw new Error('Target not specified');
  }

  const sections = target.split(':');
  const dirName = sections[0];
  const ruleName = sections[sections.length - 1];
  if (!dirName) {
    throw new Error('File name not found');
  }

  if (!ruleName) {
    throw new Error('Target name not found');
  }

  const analysis$ = fromEventPattern<string>(
      handler => {
        const fileName = path.join(dirName, CONFIG_NAME);
        fs.readFile(fileName, {encoding: 'utf8'}, (_err, data) => handler(data));
      },
  )
  .pipe(
      map(content => yaml.parse(content)),
      map(parsed => {
        if (!CONFIG_SPEC_TYPE.check(parsed)) {
          throw new Error('File is not a valid config file');
        }

        const rule = parsed[ruleName];
        if (!rule) {
          throw new Error(chalk`Rule {underline ${ruleName}} cannot be found`);
        }

        return rule;
      }),
      switchMap(rule => analyzeRule(dirName, rule, ruleName)),
  );

  return combineLatest([
      projectRoot$,
      analysis$,
  ])
  .pipe(
      map(([projectRoot, analysis]) => {
        return [
          formatMessage(MessageType.SUCCESS, 'Analysis:'),
          formatMessage(MessageType.PROGRESS, ''),
          formatMessage(
              MessageType.PROGRESS,
              chalk`Project root: {underline ${projectRoot}}`,
          ),
          formatMessage(MessageType.PROGRESS, ''),
          formatMessage(MessageType.PROGRESS, analysis),
        ].join('\n');
      }),
      take(1),
  );
}

function analyzeRule(
    dir: string,
    spec: RuleSpec,
    ruleName: string,
    pad: string = '',
): Observable<string> {
  if (RENDER_SPEC_TYPE.check(spec)) {
    return analyzeRenderRule(dir, spec, `${pad}${PAD}`)
        .pipe(
            map(ruleStr => [printRule(ruleName, spec.type, pad), ruleStr].join('\n')),
            take(1),
        );
  } else {
    return observableOf(printRule(ruleName, 'unknown', pad));
  }
}

function analyzeRenderRule(dir: string, spec: RenderSpec, pad: string): Observable<string> {
  const inputStr$ = printObject(
      spec.inputs,
      value => {
        if (value instanceof Glob) {
          return concat(
              observableOf('['),
              value.resolveFiles(dir).pipe(
                  map(file => `${pad}${PAD}${PAD}${file}`),
              ),
              observableOf(`${pad}${PAD}]`),
          )
          .pipe(
            scan((acc, value) => `${acc}\n${value}`),
            takeLast(1),
          );
        } else if (typeof value === 'string') {
          return observableOf(value);
        } else {
          return observableOf(value.join('\n'));
        }
      },
      `${pad}${PAD}`,
  );
  return inputStr$.pipe(
      map(inputStr => {
        const lines: string[] = [];
        lines.push(`${pad}inputs:`);
        lines.push(inputStr);
        lines.push(`${pad}output: ${spec.output}`);
        lines.push(`${pad}processor: ${spec.processor}`);

        return lines.join('\n');
      }),
      take(1),
  );
}

function printRule(ruleName: string, type: string, pad: string): string {
  return chalk`${pad}${ruleName} {underline ${type}}`;
}

function printObject<V>(
    obj: {[key: string]: V},
    valueStringifier: (value: V) => Observable<string>,
    pad: string,
): Observable<string> {
  return observableOf(...Object.keys(obj))
      .pipe(
          switchMap(key => valueStringifier(obj[key])
              .pipe(
                  map(str => `${pad}${key}: ${str}`),
              ),
          ),
          scan((acc, line) => `${acc}\n${line}`),
      );
}
