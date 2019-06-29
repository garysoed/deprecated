import * as commandLineArgs from 'command-line-args';
import { CLI as HELP_CLI, help } from './cli/help';
import { init } from './cli/init';
import { printSummary } from './cli/print-summary';
import { CommandType } from './types/command-type';

const COMMAND_OPTION = 'command';
const OPTIONS = [
  {
    name: COMMAND_OPTION,
    defaultOption: true,
  },
];
const CLI = {
  body: HELP_CLI.body,
  title: 'Thoth',
  summary: 'Manages a chain of rendering processes to render your documents.',
  synopsis: '$ thoth {underline command} [command options]',
};


const options = commandLineArgs(OPTIONS, {stopAtFirstUnknown: true});
switch (options[COMMAND_OPTION]) {
  case CommandType.HELP:
    help(options._unknown || []);
    break;
  case CommandType.INIT:
    init(options._unknown || []);
    break;
  default:
    printSummary(CLI);
    break;
}
