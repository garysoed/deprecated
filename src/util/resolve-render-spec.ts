
import { combineLatest, Observable, of as observableOf, throwError } from '@rxjs';
import { map, share, switchMap } from '@rxjs/operators';

import { getBuiltInProcessor } from '../processor/builtin/get-built-in-processor';
import { Processor } from '../processor/type/processor';
import { AssignableState, isAssignableTo } from '../processor/util/is-assignable-to';
import { RenderInputs, RenderRule } from '../types/render-rule';
import { RenderSpec, TYPE as RENDER_SPEC_TYPE } from '../types/render-spec';
import { Rule } from '../types/rule';
import { RuleSpec } from '../types/rule-spec';
import { Glob } from '../types/yaml/glob';

import { getProcessorType } from './get-processor-type';
import { loadRuleSpec } from './load-rule-spec';
import { parseTarget } from './parse-target';


export function resolveRenderSpec(
    spec: RenderSpec,
    filePath: string,
    ruleName: string,
    rootPath: string,
): Observable<RenderRule> {
  const rule = resolveRule(spec, filePath, ruleName);
  const input$List: Array<Observable<{input: Array<string|RenderRule>; key: string}>> = [];
  for (const key in spec.inputs) {
    if (!spec.inputs.hasOwnProperty(key)) {
      continue;
    }

    const specValue = spec.inputs[key];
    input$List.push(resolveInputValue(specValue, rootPath).pipe(map(input => ({input, key}))));
  }

  const inputMap$: Observable<Map<string, Array<string|RenderRule>>> = input$List.length <= 0 ?
      observableOf(new Map()) :
      combineLatest(input$List)
          .pipe(
              map(entries => {
                const inputMap = new Map<string, Array<string|RenderRule>>();
                for (const {input, key} of entries) {
                  inputMap.set(key, input);
                }
                return inputMap;
              }),
              share(),
          );

  const inputs$: Observable<RenderInputs> = inputMap$.pipe(
      map(entries => {
        const inputs: RenderInputs = new Map<string, string[]>();
        for (const [key, mixed] of entries) {
          const inputFiles: string[] = [];
          for (const file of mixed) {
            if (typeof file === 'string') {
              inputFiles.push(file);
            } else {              inputFiles.push(...file.outputs);
            }
          }
          inputs.set(key, inputFiles);
        }
        return inputs;
      }),
  );

  const deps$: Observable<RenderRule[]> = inputMap$.pipe(
      map(entries => {
        const deps = [];
        for (const [, pair] of entries) {
          deps.push(...pair.filter((value): value is RenderRule => typeof value !== 'string'));
        }
        return deps;
      }),
  );

  const processor = resolveProcessor(spec.processor);
  if (!processor) {
    return throwError(new Error(`Processor ${spec.processor} cannot be found`));
  }

  const outputs$ = resolveOutputFiles(spec.output, inputs$, processor);
  return combineLatest([
    deps$,
    inputs$,
    outputs$,
  ])
  // tslint:disable-next-line: no-object-literal-type-assertion
  .pipe(map(([deps, inputs, outputs]) => ({...rule, deps, inputs, outputs} as RenderRule)));
}

function generateOutputs(
    template: string,
    valuesMap: Map<string, string[]>,
    ): string[] {
  if (valuesMap.size === 0) {
    return [template];
  }

  const [[key, values], ...rest] = valuesMap;
  const restMap = new Map(rest);
  const output = [];

  for (const value of values) {
    output.push(...generateOutputs(template.replace(`[${key}]`, value), restMap));
  }
  return output;
}

function resolveInputValue(
    inputValue: Glob|string|Array<Glob|string>,
    root: string,
): Observable<Array<string|RenderRule>> {
  if (inputValue instanceof Glob) {
    return inputValue.resolveFiles(root);
  } else if (typeof inputValue === 'string') {
    // Check if value is a target.
    const target = parseTarget(inputValue);
    if (!target) {
      return observableOf([inputValue]);
    }

    return loadRuleSpec(target, root).pipe(
        switchMap(spec => {
          if (!RENDER_SPEC_TYPE.check(spec)) {
            return observableOf([]);
          }

          return resolveRenderSpec(spec, target.dir, target.rule, root)
              .pipe(map(resolvedSpec => [resolvedSpec]));
        }),
    );
  } else {
    if (inputValue.length <= 0) {
      return observableOf([]);
    }

    const resolvedList = inputValue.map(value => resolveInputValue(value, root));
    return combineLatest(resolvedList)
        .pipe(map(resolveds => resolveds.reduce((acc, item) => [...acc, ...item])));
  }
}

function resolveOutputFiles(
    template: string,
    inputs$: Observable<Map<string, string[]>>,
    processor: Processor,
): Observable<string[]> {
  return inputs$.pipe(
    map(inputs => {
      const unnestMap = new Map<string, string[]>();

      // For every input key, check the compatibility.
      for (const [key, files] of inputs) {
        if (!processor.inputType.hasOwnProperty(key)) {
          continue;
        }

        const inputType = getProcessorType(files);
        const assignableState = isAssignableTo(inputType, processor.inputType[key]);
        switch (assignableState) {
          case AssignableState.UNASSIGNABLE:
            throw new Error(`Input parameter ${key} is incompatible`);
          case AssignableState.ASSIGNABLE_WITH_UNNEST:
            unnestMap.set(key, files);
            break;
        }
      }

      // TODO: Now generate all the output files.
      return generateOutputs(template, unnestMap);
    }),
);
}

function resolveProcessor(processor: string): Processor|null {
  // TODO: Support other types.
  return getBuiltInProcessor(processor);
}

function resolveRule(spec: RuleSpec, filePath: string, ruleName: string): Rule {
  return {
    name: `${filePath}:${ruleName}`,
    type: spec.type,
  };
}
