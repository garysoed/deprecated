import { formatMessage, MessageType } from '@gs-tools/cli';
import * as commandLineArgs from 'command-line-args';
import * as yaml from 'yaml';
import { analyze } from './cli/analyze';
import { CLI as HELP_CLI, help } from './cli/help';
import { init } from './cli/init';
import { printSummary } from './cli/print-summary';
import { CommandType } from './types/command-type';
import { TAG as GLOB_TAG } from './types/glob';

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

(yaml.defaultOptions as any).customTags = [GLOB_TAG];

const options = commandLineArgs(OPTIONS, {stopAtFirstUnknown: true});
async function run(): Promise<void> {
  switch (options[COMMAND_OPTION]) {
    case CommandType.ANALYZE:
      await analyze(options._unknown || []);
      break;
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
}

run().then(
    null,
    (e: Error) => console.log(formatMessage(MessageType.FAILURE, e.stack || e.message)),
);
