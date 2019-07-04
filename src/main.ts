import * as commandLineArgs from 'command-line-args';
import * as yaml from 'yaml';

import { formatMessage, MessageType } from '@gs-tools/cli';
import { Observable, of as observableOf } from '@rxjs';

// import { analyze } from './cli/analyze';
import { CLI as HELP_CLI, help } from './cli/help';
import { init } from './cli/init';
import { printSummary } from './cli/print-summary';
import { CommandType } from './types/command-type';
import { TAG as GLOB_TAG } from './types/yaml/glob';

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
function run(): Observable<string> {
  switch (options[COMMAND_OPTION]) {
    // case CommandType.ANALYZE:
    //   return analyze(options._unknown || []);
    case CommandType.HELP:
      return observableOf(help(options._unknown || []));
    case CommandType.INIT:
      return init(options._unknown || []);
    default:
      return observableOf(printSummary(CLI));
  }
}

// tslint:disable: no-console
run().subscribe(
    results => console.log(results),
    (e: Error) => console.log(formatMessage(MessageType.FAILURE, e.stack || e.message)),
);
