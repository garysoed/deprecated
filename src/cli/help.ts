import * as commandLineArgs from 'command-line-args';

import { CommandType } from '../types/command-type';

// import { CLI as ANALYZE_CLI } from './analyze';
import { CLI as INIT_CLI } from './init';
import { printSummary } from './print-summary';
import { CLI as RENDER_CLI } from './render';

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
      // {name: CommandType.ANALYZE, summary: ANALYZE_CLI.summary},
      {name: CommandType.INIT, summary: INIT_CLI.summary},
      {name: CommandType.RENDER, summary: RENDER_CLI.summary},
    ],
  }),
  summary: 'Display help on commands',
  synopsis: `$ thoth ${CommandType.HELP} <command>`,
};

export function help(argv: string[]): string {
  const options = commandLineArgs(OPTIONS, {argv, stopAtFirstUnknown: true});
  switch (options[COMMAND_OPTION]) {
    // case CommandType.ANALYZE:
    //   return printSummary(ANALYZE_CLI);
    case CommandType.HELP:
      return printSummary(CLI);
    case CommandType.INIT:
      return printSummary(INIT_CLI);
    case CommandType.RENDER:
      return printSummary(RENDER_CLI);
    default:
      return printSummary(CLI);
  }
}

