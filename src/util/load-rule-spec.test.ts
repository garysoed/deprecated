import * as path from 'path';
import * as yaml from 'yaml';

import { assert, setup, should, teardown, test } from '@gs-testing';
import { take } from '@rxjs/operators';

import { FsTester, newTester } from '../testing/fs-tester';
import { RuleType } from '../types/rule-type';

import { CONFIG_NAME, loadRuleSpec } from './load-rule-spec';


test('@thoth/util/load-rule-spec', () => {
  let fsTester: FsTester;

  setup(async () => {
    fsTester = await newTester();
  });

  teardown(async () => {
    await fsTester.cleanup();
  });

  should(`return the correct rule`, async () => {
    const dir = 'dir';
    const rule = 'rule';
    const configContent = yaml.stringify({
      [rule]: {
        type: RuleType.RENDER,
      },
    });
    await fsTester.createFile(path.join(dir, CONFIG_NAME), configContent);

    const spec = await loadRuleSpec({dir, rule}, fsTester.root).pipe(take(1)).toPromise();
    assert(spec!.type).to.equal(RuleType.RENDER);
  });

  should(`return null if the rule cannot be found`, async () => {
    const dir = 'dir';
    const rule = 'rule';
    const configContent = yaml.stringify({});
    await fsTester.createFile(path.join(dir, CONFIG_NAME), configContent);

    const spec = await loadRuleSpec({dir, rule}, fsTester.root).pipe(take(1)).toPromise();
    assert(spec).to.beNull();
  });

  should(`throw error if the file is invalid`, async () => {
    const dir = 'dir';
    const rule = 'rule';
    await fsTester.createFile(path.join(dir, CONFIG_NAME), 'content');

    try {
      await loadRuleSpec({dir, rule}, fsTester.root).pipe(take(1)).toPromise();
      fail('Expected to throw');
    } catch (e) {
      assert((e as Error).message).to.match(/config file/);
    }
  });
});
