import { Target } from '../types/target';


export function parseTarget(str: string): Target|null {
  const sections = str.split(':');
  const dir = sections[0];
  const rule = sections[sections.length - 1];

  if (sections.length < 2 || !dir || !rule) {
    return null;
  }

  return {dir, rule};
}
