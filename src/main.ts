import * as commandLineArgs from 'command-line-args';
import { CommandType } from './command-type';
import { CLI as HELP_CLI, help } from './help';
import { init } from './init';
import { printSummary } from './print-summary';

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
