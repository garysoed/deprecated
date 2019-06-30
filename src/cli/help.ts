import * as commandLineArgs from 'command-line-args';

import { CommandType } from '../types/command-type';

import { CLI as ANALYZE_CLI } from './analyze';
import { CLI as INIT_CLI } from './init';
import { printSummary } from './print-summary';

const COMMAND_OPTION = 'command';
const OPTIONS = [
  {
    name: COMMAND_OPTION,
    defaultOption: true,
  },
];

export const CLI = {
  title: 'Thoth: Help',
  body: () => ({
    header: 'Commands',
    content: [
      {name: CommandType.HELP, summary: CLI.summary},
      {name: CommandType.ANALYZE, summary: ANALYZE_CLI.summary},
      {name: CommandType.INIT, summary: INIT_CLI.summary},
    ],
  }),
  summary: 'Display help on commands',
  synopsis: `$ thoth ${CommandType.HELP} <command>`,
};

export function help(argv: string[]): void {
  const options = commandLineArgs(OPTIONS, {argv, stopAtFirstUnknown: true});
  switch (options[COMMAND_OPTION]) {
    case CommandType.ANALYZE:
      printSummary(ANALYZE_CLI);
      return;
    case CommandType.HELP:
      printSummary(CLI);
      return;
    case CommandType.INIT:
      printSummary(INIT_CLI);
      return;
    default:
      printSummary(CLI);
      return;
  }
}

