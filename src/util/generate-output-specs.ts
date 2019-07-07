import { Processor } from '../processor/type/processor';
import { AssignableState, isAssignableTo } from '../processor/util/is-assignable-to';

import { getProcessorType } from './get-processor-type';


/**
 * Generates an array of map of input key to their value for each unnest type, for each possible
 * combination of unnest types.
 */
export function generateOutputSpecs(
    processor: Processor,
    unnestInputs: string[],
    inputs: Map<string, string[]>,
): Array<Map<string, string>> {
  const unnestMap = new Map<string, string[]>();
  for (const key of unnestInputs) {
    const value = inputs.get(key);
    if (!value) {
      continue;
    }

    if (!processor.inputType.hasOwnProperty(key)) {
      continue;
    }

    const inputType = getProcessorType(value);
    const assignableState = isAssignableTo(inputType, processor.inputType[key]);
    switch (assignableState) {
      case AssignableState.UNASSIGNABLE:
        throw new Error(`Input parameter ${key} is incompatible`);
      case AssignableState.ASSIGNABLE_WITH_UNNEST:
        unnestMap.set(key, value);
        break;
    }
  }

  return generateOutputSpecsHelper(new Map(), unnestMap);
}

function generateOutputSpecsHelper(
    builtMap: Map<string, string>,
    valuesMap: Map<string, string[]>,
): Array<Map<string, string>> {
  if (valuesMap.size === 0) {
    return [new Map(builtMap)];
  }

  const [[key, values], ...rest] = valuesMap;
  const restMap = new Map(rest);
  const output = [];

  for (const value of values) {
    output.push(...generateOutputSpecsHelper(new Map([...builtMap, [key, value]]), restMap));
  }
  return output;
}
