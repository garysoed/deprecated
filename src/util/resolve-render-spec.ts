import { combineLatest, Observable, of as observableOf } from '@rxjs';
import { map, switchMap } from '@rxjs/operators';

import { RenderRule } from '../types/render-rule';
import { RenderSpec, TYPE as RENDER_SPEC_TYPE } from '../types/render-spec';
import { Rule } from '../types/rule';
import { RuleSpec } from '../types/rule-spec';
import { Glob } from '../types/yaml/glob';

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
  const inputs$ = input$List.length <= 0 ?
      observableOf({}) :
      combineLatest(input$List)
          .pipe(
              map(entries => {
                const inputs: {[key: string]: Array<string|RenderRule>} = {};
                for (const {input, key} of entries) {
                  inputs[key] = input;
                }
                return inputs;
              }),
          );

  // TODO: Outputs, Processor
  const outputs$ = observableOf([]);
  return combineLatest([
    inputs$,
    outputs$,
  ])
  // tslint:disable-next-line: no-object-literal-type-assertion
  .pipe(map(([inputs, outputs]) => ({...rule, inputs, outputs} as RenderRule)));
}

function resolveRule(spec: RuleSpec, filePath: string, ruleName: string): Rule {
  return {
    name: `${filePath}:${ruleName}`,
    type: spec.type,
  };
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
