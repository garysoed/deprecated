import * as commandLineArgs from 'command-line-args';
import * as commandLineUsage from 'command-line-usage';
import { CommandType } from './command-type';
import { printSummary } from './print-summary';
import { CliSummary } from './types/cli-summary';

const COMMAND_OPTION = 'command';
const OPTIONS = [
  {
    name: COMMAND_OPTION,
    defaultOption: true,
  },
];

export const CLI = {
  title: 'Help',
  body: () => ({
    header: 'Commands',
    content: [
      {name: CommandType.HELP, summary: CLI.summary},
      {name: CommandType.INIT, summary: 'Initializes thoth project.'},
    ],
  }),
  summary: 'Display help on commands',
  synopsis: `$ thoth ${CommandType.HELP} <command>`,
};

export function help(argv: string[]): void {
  const options = commandLineArgs(OPTIONS, {argv, stopAtFirstUnknown: true});
  switch (options[COMMAND_OPTION]) {
    case CommandType.HELP:
    default:
      printSummary(CLI);
      break;
  }
}

