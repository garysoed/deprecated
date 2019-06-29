import { formatMessage, MessageType } from '@gs-tools/cli';
import * as commandLineArgs from 'command-line-args';
import { Commands } from './commands';
import { init } from './init';

const COMMAND_OPTION = 'command';
const options = commandLineArgs(
    [
      {
        name: COMMAND_OPTION,
        defaultOption: true,
      },
    ],
    {
      stopAtFirstUnknown: true,
    },
);

const command = options[COMMAND_OPTION];
switch (command) {
  case Commands.INIT:
    init(options._unknown || []);
    break;
  default:
    console.log(formatMessage(MessageType.FAILURE, `Unknown command: ${command}`));
    break;
}
