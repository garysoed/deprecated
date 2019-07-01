import chalk from 'chalk';

import { Target } from '../types/target';

export function parseTarget(str: string): Target {
  const sections = str.split(':');
  const dir = sections[0];
  const rule = sections[sections.length - 1];

  if (sections.length < 2 || !dir || !rule) {
    throw new Error(chalk`Target {underline ${str}} is invalid`);
  }

  return {dir, rule};
}
