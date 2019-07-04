// import chalk from 'chalk';
// import * as commandLineArgs from 'command-line-args';
// import { Target } from 'src/types/target';
// import { resolveFileList } from 'src/util/resolve-file-list';

// import { formatMessage, MessageType } from '@gs-tools/cli';
// import { assertNonNull } from '@gs-tools/rxjs';
// import { combineLatest, concat, Observable, of as observableOf } from '@rxjs';
// import { map, scan, switchMap, take, takeLast } from '@rxjs/operators';

// import { CommandType } from '../types/command-type';
// import { RenderSpec, TYPE as RENDER_SPEC_TYPE } from '../types/render-spec';
// import { RuleSpec } from '../types/rule-spec';
// import { findProjectRoot } from '../util/find-project-root';
// import { loadRuleSpec } from '../util/load-rule-spec';
// import { parseTarget } from '../util/parse-target';

// const PAD = '  ';

// enum Options {
//   TARGET = 'target',
// }
// const OPTIONS = [
//   {
//     name: Options.TARGET,
//     defaultOption: true,
//     type: parseTarget,
//     typeLabel: '{underline target}',
//   },
// ];
// export const CLI = {
//   title: 'Thoth: Analyze',
//   body: () => ({}),
//   summary: 'Analyzes the given rule file.',
//   synopsis: `$ thoth ${CommandType.ANALYZE} {underline target}`,
// };

// export function analyze(argv: string[]): Observable<string> {
//   const options = commandLineArgs(OPTIONS, {argv});

//   const target = options[Options.TARGET] as Target;
//   if (!target) {
//     throw new Error('Target not specified');
//   }

//   const {dir: dirName, rule: ruleName} = target;

//   const projectRoot$ = findProjectRoot().pipe(assertNonNull('Project root not found'));
//   const analysis$ = loadRuleSpec(target)
//       .pipe(
//           assertNonNull(chalk`Rule {underline ${ruleName}} cannot be found`),
//           switchMap(rule => analyzeRule(dirName, rule, ruleName)),
//       );

//   return combineLatest([
//       projectRoot$,
//       analysis$,
//   ])
//   .pipe(
//       map(([projectRoot, analysis]) => {
//         return [
//           formatMessage(MessageType.SUCCESS, 'Analysis:'),
//           formatMessage(MessageType.PROGRESS, ''),
//           formatMessage(
//               MessageType.PROGRESS,
//               chalk`Project root: {underline ${projectRoot}}`,
//           ),
//           formatMessage(MessageType.PROGRESS, ''),
//           formatMessage(MessageType.PROGRESS, analysis),
//         ].join('\n');
//       }),
//       take(1),
//   );
// }

// function analyzeRule(
//     dir: string,
//     spec: RuleSpec,
//     ruleName: string,
//     pad: string = '',
// ): Observable<string> {
//   if (RENDER_SPEC_TYPE.check(spec)) {
//     return analyzeRenderRule(dir, spec, `${pad}${PAD}`)
//         .pipe(
//             map(ruleStr => [printRule(ruleName, spec.type, pad), ruleStr].join('\n')),
//             take(1),
//         );
//   } else {
//     return observableOf(printRule(ruleName, 'unknown', pad));
//   }
// }

// function analyzeRenderRule(dir: string, spec: RenderSpec, pad: string): Observable<string> {
//   const inputStr$ = printObject(
//       spec.inputs,
//       value => concat(
//           observableOf('['),
//           resolveFileList(value, dir).pipe(
//               map(files => files.map(file => `${pad}${PAD}${PAD}${file}`).join('\n')),
//           ),
//           observableOf(`${pad}${PAD}]`),
//       )
//       .pipe(
//           scan((acc, line) => `${acc}\n${line}`),
//           takeLast(1),
//       ),
//       `${pad}${PAD}`,
//   );
//   return inputStr$.pipe(
//       map(inputStr => {
//         const lines: string[] = [];
//         lines.push(`${pad}inputs:`);
//         lines.push(inputStr);
//         lines.push(`${pad}output: ${spec.output}`);
//         lines.push(`${pad}processor: ${spec.processor}`);

//         return lines.join('\n');
//       }),
//       take(1),
//   );
// }

// function printRule(ruleName: string, type: string, pad: string): string {
//   return chalk`${pad}${ruleName} {underline ${type}}`;
// }

// function printObject<V>(
//     obj: {[key: string]: V},
//     valueStringifier: (value: V) => Observable<string>,
//     pad: string,
// ): Observable<string> {
//   return observableOf(...Object.keys(obj))
//       .pipe(
//           switchMap(key => valueStringifier(obj[key])
//               .pipe(
//                   map(str => `${pad}${key}: ${str}`),
//               ),
//           ),
//           scan((acc, line) => `${acc}\n${line}`),
//       );
// }
