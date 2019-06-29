import * as commandLineUsage from 'command-line-usage';
import { CliSummary } from '../types/cli-summary';

export function printSummary(summary: CliSummary): void {
  console.log(commandLineUsage([
    {
      header: summary.title,
      content: summary.summary,
    },
    {
      header: 'Synopsis',
      content: summary.synopsis,
    },
    summary.body(),
  ]));
}
