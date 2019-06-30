import chalk from 'chalk';
import * as commandLineArgs from 'command-line-args';
import * as fs from 'fs';
import { formatMessage, MessageType } from 'gs-tools/export/cli';
import * as path from 'path';
import * as yaml from 'yaml';
import { CommandType } from '../types/command-type';
import { TYPE as CONFIG_SPEC_TYPE } from '../types/config-spec';
import { Glob } from '../types/glob';
import { RenderSpec, TYPE as RENDER_SPEC_TYPE } from '../types/render-spec';
import { RuleSpec } from '../types/rule-spec';

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

export async function analyze(argv: string[]): Promise<void> {
  const options = commandLineArgs(OPTIONS, {argv});
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

  const content = await new Promise<string>(resolve => {
    const fileName = path.join(dirName, CONFIG_NAME);
    fs.readFile(fileName, {encoding: 'utf8'}, (_err, data) => resolve(data));
  });

  const parsed = yaml.parse(content);
  if (!CONFIG_SPEC_TYPE.check(parsed)) {
    throw new Error('File is not a valid config file');
  }

  const rule = parsed[ruleName];
  if (!rule) {
    throw new Error(chalk`Rule {underline ${ruleName}} cannot be found`);
  }

  const analysis = await analyzeRule(dirName, rule, ruleName);
  console.log(formatMessage(MessageType.SUCCESS, 'Analysis:'));
  console.log(formatMessage(MessageType.PROGRESS, analysis));
}

async function analyzeRule(
    dir: string,
    spec: RuleSpec,
    ruleName: string,
    pad: string = '',
): Promise<string> {
  const lines: string[] = [];

  if (RENDER_SPEC_TYPE.check(spec)) {
    lines.push(printRule(ruleName, spec.type, pad));
    lines.push(await analyzeRenderRule(dir, spec, `${pad}${PAD}`));
  } else {
    lines.push(printRule(ruleName, 'unknown', pad));
  }

  return lines.join('\n');
}

async function analyzeRenderRule(dir: string, spec: RenderSpec, pad: string): Promise<string> {
  const lines: string[] = [];
  lines.push(`${pad}inputs:`);
  lines.push(await printObject(
      spec.inputs,
      async value => {
        if (value instanceof Glob) {
          const lines: string[] = [];
          lines.push('[');

          const files = await value.resolveFiles(dir);
          for (const file of files) {
            lines.push(`${pad}${PAD}${PAD}${file}`);
          }
          lines.push(`${pad}${PAD}]`);
          return lines.join('\n');
        } else if (typeof value === 'string') {
          return value;
        } else {
          return value.join('\n');
        }
      },
      `${pad}${PAD}`,
  ));
  lines.push(`${pad}output: ${spec.output}`);
  lines.push(`${pad}processor: ${spec.processor}`);

  return lines.join('\n');
}

function printRule(ruleName: string, type: string, pad: string): string {
  return chalk`${pad}${ruleName} {underline ${type}}`;
}

async function printObject<V>(
    obj: {[key: string]: V},
    valueStringifier: (value: V) => Promise<string>,
    pad: string,
): Promise<string> {
  const lines: string[] = [];
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }

    const value = obj[key];
    lines.push(`${pad}${key}: ${await valueStringifier(value)}`);
  }

  return lines.join('\n');
}
