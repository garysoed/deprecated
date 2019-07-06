import * as path from 'path';
import * as yaml from 'yaml';

import { assert, match, setup, should, teardown, test } from '@gs-testing';
import { take } from '@rxjs/operators';

import { FsTester, newTester } from '../testing/fs-tester';
import { RenderRule } from '../types/render-rule';
import { RenderSpec } from '../types/render-spec';
import { RuleType } from '../types/rule-type';
import { Glob } from '../types/yaml/glob';

import { CONFIG_NAME } from './load-rule-spec';
import { resolveRenderSpec } from './resolve-render-spec';


test('@thoth/util/resolve-render-spec', () => {
  let fsTester: FsTester;

  setup(async () => {
    fsTester = await newTester();
  });

  teardown(async () => {
    await fsTester.cleanup();
  });

  test('resolveRenderSpec', () => {
    should(`resolve correctly`, async () => {
      const processor = '$markdown';
      const filePath = './path';
      const ruleName = 'rule';
      const ruleDName = 'ruled';

      const configContent = yaml.stringify({
        [ruleDName]: {
          inputs: {},
          output: 'output.txt',
          processor: '$markdown',
          type: RuleType.RENDER,
        },
      });

      await fsTester.createFile('file-b-1.txt');
      await fsTester.createFile('file-b-2.txt');
      await fsTester.createFile('file-b-3.txt');
      await fsTester.createFile(path.join(filePath, CONFIG_NAME), configContent);

      const spec: RenderSpec = {
        type: RuleType.RENDER,
        inputs: {
          a: 'file-a.txt',
          b: new Glob('file-b-*.txt'),
          c: ['file-c-1.txt', 'file-c-2.txt'],
          d: `${filePath}:${ruleDName}`,
        },
        output: 'output.txt',
        processor,
      };

      const render = await resolveRenderSpec(spec, filePath, ruleName, fsTester.root)
          .pipe(take(1))
          .toPromise();

      assert(render.name).to.equal(`${filePath}:${ruleName}`);
      assert(render.type).to.equal(RuleType.RENDER);
      assert(render.inputs.get('a')!).to.haveExactElements([spec.inputs.a as string]);
      assert(render.inputs.get('b')!).to.haveExactElements([
        'file-b-1.txt',
        'file-b-2.txt',
        'file-b-3.txt',
      ]);
      assert(render.inputs.get('c')!).to.haveExactElements([
        'file-c-1.txt',
        'file-c-2.txt',
      ]);
      assert(render.inputs.get('d')!).to.haveExactElements(['output.txt']);
      assert(render.deps).to.haveExactElements([
        match.anyObjectThat<RenderRule>().haveProperties({
          name: `${filePath}:${ruleDName}`,
        }),
      ]);
      assert(render.outputs).to.haveExactElements(['output.txt']);
    });

    should(`throw error if processor cannot be found`, async () => {
      const filePath = './path';
      const ruleName = 'rule';

      const spec: RenderSpec = {
        type: RuleType.RENDER,
        inputs: {},
        output: 'output.txt',
        processor: 'unknown',
      };

      try {
        await resolveRenderSpec(spec, filePath, ruleName, fsTester.root)
            .pipe(take(1))
            .toPromise();
        fail('error expected');
      } catch (e) {
        assert((e as Error).message).to.match(/cannot be found/);
      }
    });
  });

  test('generateOutputs', () => {
    should(`generate outputs correctly`, async () => {
      const processor = '$markdown';
      const filePath = './path';
      const ruleName = 'rule';

      await fsTester.createFile('file-1.md');
      await fsTester.createFile('file-2.md');
      await fsTester.createFile('file-3.md');

      const spec: RenderSpec = {
        type: RuleType.RENDER,
        inputs: {
          file: new Glob('file-*.md'),
        },
        output: `[file].html`,
        processor,
      };

      const render = await resolveRenderSpec(spec, filePath, ruleName, fsTester.root)
          .pipe(take(1))
          .toPromise();

      assert(render.outputs).to.haveExactElements([
        'file-1.md.html',
        'file-2.md.html',
        'file-3.md.html',
      ]);
    });

    should(`return one item if there are no inputs`, async () => {
      const processor = '$markdown';
      const filePath = './path';
      const ruleName = 'rule';

      const spec: RenderSpec = {
        type: RuleType.RENDER,
        inputs: {},
        output: `[file].html`,
        processor,
      };

      const render = await resolveRenderSpec(spec, filePath, ruleName, fsTester.root)
          .pipe(take(1))
          .toPromise();

      assert(render.outputs).to.haveExactElements(['[file].html']);
    });
  });

  test('resolveInputValue', () => {
    let spec: RenderSpec;

    setup(() => {
      spec = {
        type: RuleType.RENDER,
        inputs: {},
        output: 'output.txt',
        processor: '$markdown',
      };
    });

    should(`resolve arrays of paths, targets and globs correctly`, async () => {
      await fsTester.createFile('path.txt');

      const configContent = yaml.stringify({
        rule: {
          inputs: {},
          output: 'output.txt',
          processor: '$markdown',
          type: RuleType.RENDER,
        },
      });
      await fsTester.createFile(path.join('path/target', CONFIG_NAME), configContent);
      await fsTester.createFile('file-a.txt');
      await fsTester.createFile('file-b.txt');
      await fsTester.createFile('file-c.txt');

      spec.inputs.a = [
        'path.txt',
        'path/target:rule',
        new Glob('file-*.txt'),
      ];

      const render = await resolveRenderSpec(spec, 'filePath', 'rule', fsTester.root)
          .pipe(take(1))
          .toPromise();

      assert(render.inputs.get('a')).to.equal(
          match.anyArrayThat<RenderRule|string>().haveExactElements([
            'path.txt',
            'output.txt',
            'file-a.txt',
            'file-b.txt',
            'file-c.txt',
          ]),
      );
      assert(render.deps).to.haveExactElements([
        match.anyObjectThat<RenderRule>().haveProperties({
          name: `path/target:rule`,
        }),
      ]);
    });

    should(`resolve empty array correctly`, async () => {
      spec.inputs.a = [];

      const render = await resolveRenderSpec(spec, 'filePath', 'rule', fsTester.root)
          .pipe(take(1))
          .toPromise();

      assert(render.inputs.get('a')).to.equal(
          match.anyArrayThat<RenderRule|string>().haveExactElements([]),
      );
    });

    should(`resolve a target correctly`, async () => {
      const configContent = yaml.stringify({
        rule: {
          inputs: {},
          output: 'output.txt',
          processor: '$markdown',
          type: RuleType.RENDER,
        },
      });
      await fsTester.createFile(path.join('path/target', CONFIG_NAME), configContent);

      spec.inputs.a = 'path/target:rule';

      const render = await resolveRenderSpec(spec, 'filePath', 'rule', fsTester.root)
          .pipe(take(1))
          .toPromise();

      assert(render.inputs.get('a')).to
          .equal(match.anyArrayThat().haveExactElements(['output.txt']));
      assert(render.deps).to.haveExactElements([
        match.anyObjectThat<RenderRule>().haveProperties({
          name: `path/target:rule`,
        }),
      ]);
    });

    should(`ignore non render rules`, async () => {
      const configContent = yaml.stringify({
        rule: {
          type: RuleType.PROCESSOR,
        },
      });
      await fsTester.createFile(path.join('path/target', CONFIG_NAME), configContent);

      spec.inputs.a = 'path/target:rule';

      const render = await resolveRenderSpec(spec, 'filePath', 'rule', fsTester.root)
          .pipe(take(1))
          .toPromise();

      assert(render.inputs.get('a')).to.equal(
          match.anyArrayThat<RenderRule|string>().haveExactElements([]),
      );
    });

    should(`treat invalid target as file path`, async () => {
      spec.inputs.a = 'path/target';

      const render = await resolveRenderSpec(spec, 'filePath', 'rule', fsTester.root)
          .pipe(take(1))
          .toPromise();

      assert(render.inputs.get('a')).to.equal(
          match.anyArrayThat<RenderRule|string>().haveExactElements(['path/target']),
      );
    });

    should(`resolve glob correctly`, async () => {
      await fsTester.createFile('file-a.txt');
      await fsTester.createFile('file-b.txt');
      await fsTester.createFile('file-c.txt');

      spec.inputs.a = [
        new Glob('file-*.txt'),
      ];

      const render = await resolveRenderSpec(spec, 'filePath', 'rule', fsTester.root)
          .pipe(take(1))
          .toPromise();

      assert(render.inputs.get('a')).to.equal(
          match.anyArrayThat<RenderRule|string>().haveExactElements([
            'file-a.txt',
            'file-b.txt',
            'file-c.txt',
          ]),
      );
    });
  });

  test('resolveOutputFiles', () => {
    should(`unnest input parameters correctly`, async () => {
      const processor = '$markdown';
      const filePath = './path';
      const ruleName = 'rule';

      const spec: RenderSpec = {
        type: RuleType.RENDER,
        inputs: {
          file: [
            'file-1.md',
            'file-2.md',
            'file-3.md',
          ],
        },
        output: `[file].html`,
        processor,
      };

      const render = await resolveRenderSpec(spec, filePath, ruleName, fsTester.root)
          .pipe(take(1))
          .toPromise();

      assert(render.outputs).to.haveExactElements([
        'file-1.md.html',
        'file-2.md.html',
        'file-3.md.html',
      ]);
    });

    should(`not unnest input parameter if directly assignable`, async () => {
      const processor = '$markdown';
      const filePath = './path';
      const ruleName = 'rule';

      const spec: RenderSpec = {
        type: RuleType.RENDER,
        inputs: {
          file: 'file.md',
        },
        output: `[file].html`,
        processor,
      };

      const render = await resolveRenderSpec(spec, filePath, ruleName, fsTester.root)
          .pipe(take(1))
          .toPromise();

      assert(render.outputs).to.haveExactElements([
        '[file].html',
      ]);
    });
  });
});
