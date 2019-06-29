import * as commandLineUsage from 'command-line-usage';

export interface CliSummary {
  summary: string;
  synopsis: string;
  title: string;
  body(): commandLineUsage.Section;
}
