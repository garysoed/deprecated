import { formatMessage, MessageType } from '@gs-tools/cli';
import chalk from 'chalk';
import * as commandLineArgs from 'command-line-args';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { CommandType } from './command-type';
import { ProjectConfig } from './types/project-config';

const CONFIG_FILE = 'thoth-config.yaml';

enum Options {
  DRY_RUN = 'dry-run',
  OUT_DIR = 'out-dir',
  TMP_DIR = 'tmp-dir',
}

const optionList = [
  {
    name: Options.DRY_RUN,
    alias: 'd',
    description: 'Dry run',
    type: Boolean,
    defaultValue: false,
  },
  {
    name: Options.OUT_DIR,
    alias: 'o',
    description: [
      'Directory of the output files, relative to the location of the project config file',
    ].join(''),
    typeLabel: '{underline file}',
    defaultValue: './out',
  },
  {
    name: Options.TMP_DIR,
    alias: 't',
    description: [
      'Directory of the temporary files, relative to the location of the project config file',
    ].join(''),
    typeLabel: '{underline file}',
    defaultValue: './.thoth-tmp',
  },
];

export const CLI = {
  title: 'Thoth: Initialize',
  body: () => ({
    header: 'Options',
    optionList,
  }),
  summary: 'Initializes Thoth project',
  synopsis: [
    `$ thoth ${CommandType.INIT}`,
    `[--${Options.OUT_DIR}={underline file}]`,
    `[--${Options.TMP_DIR}={underline file}]`,
    `[--${Options.DRY_RUN}]`,
  ].join(' '),
};

export function init(argv: string[]): void {
  const options = commandLineArgs(optionList, {argv, stopAtFirstUnknown: true});
  const usedOptions = [];
  for (const key in Options) {
    if (!Options.hasOwnProperty(key)) {
      continue;
    }

    const option = Options[key];
    usedOptions.push(chalk`-   ${option}: {underline ${options[option]}}`);
  }

  console.log(
      formatMessage(
          MessageType.INFO,
          `Creating Thoth project with:\n${usedOptions.join('\n')}`,
      ),
  );

  if (options[Options.DRY_RUN]) {
    return;
  }

  const config: ProjectConfig = {
    outDir: options[Options.OUT_DIR],
    tmpDir: options[Options.TMP_DIR],
  };
  const yamlStr = yaml.stringify(config);
  fs.writeFile(`./${CONFIG_FILE}`, yamlStr, () => {
    console.log(
        formatMessage(
            MessageType.SUCCESS,
            chalk`{underline ${CONFIG_FILE}} created`,
        ),
    );
  });
}
