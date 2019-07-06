import { Processor } from '../type/processor';

import { markdown } from './markdown';

export function getBuiltInProcessor(processorName: string): Processor<any>|null {
  switch (processorName) {
    case '$markdown':
      return markdown;
    default:
      return null;
  }
}
