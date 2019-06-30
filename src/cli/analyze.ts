import { formatMessage, MessageType } from '@gs-tools/cli';
import chalk from 'chalk';
import * as commandLineArgs from 'command-line-args';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { CommandType } from '../types/command-type';
import { TYPE as CONFIG_SPEC_TYPE } from '../types/config-spec';

const CONFIG_NAME = 'thoth.yml';

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
    console.log(formatMessage(MessageType.FAILURE, 'Target not specified'));
    return;
  }

  const sections = target.split(':');
  const dirName = sections[0];
  const ruleName = sections[sections.length - 1];
  if (!dirName) {
    console.log(formatMessage(MessageType.FAILURE, 'File name not found'));
    return;
  }

  if (!ruleName) {
    console.log(formatMessage(MessageType.FAILURE, 'Target name not found'));
    return;
  }

  const content = await new Promise<string>(resolve => {
    const fileName = path.join(dirName, CONFIG_NAME);
    fs.readFile(fileName, {encoding: 'utf8'}, (_err, data) => resolve(data));
  });

  try {
    const parsed = yaml.parse(content);
    if (!CONFIG_SPEC_TYPE.check(parsed)) {
      throw new Error('File is not a valid config file');
    }

    const rule = parsed[ruleName];
    if (!rule) {
      throw new Error(chalk`Rule {underline ${ruleName}} cannot be found`);
    }

    console.log(rule);
  } catch (e) {
    console.log(formatMessage(MessageType.FAILURE, e.stack, 1));
  }
}
