import * as path from 'path';
import * as yaml from 'yaml';

import { assert, fake, match, setup, should, spy, test } from '@gs-testing';
import { of as observableOf } from '@rxjs';
import { catchError } from '@rxjs/operators';

import { addFile, mockFs } from '../testing/fake-fs';
import { RuleType } from '../types/rule-type';

import { CONFIG_NAME, loadRuleSpec } from './load-rule-spec';

test('@thoth/util/load-rule-spec', () => {
  setup(() => {
    mockFs();
  });

  should(`return the correct rule`, () => {
    const dir = 'dir';
    const rule = 'rule';
    const content = 'content';

    const ruleSpec = {type: RuleType.RENDER};
    const spyParse = spy(yaml, 'parse');
    fake(spyParse).always().return({[rule]: ruleSpec});

    addFile(path.join(dir, CONFIG_NAME), {content});

    assert(loadRuleSpec({dir, rule})).to.emitSequence([ruleSpec]);
    assert(spyParse).to.haveBeenCalledWith(content);
  });

  should(`return null if the rule cannot be found`, () => {
    const dir = 'dir';
    const rule = 'rule';
    const content = 'content';

    const spyParse = spy(yaml, 'parse');
    fake(spyParse).always().return({});

    addFile(path.join(dir, CONFIG_NAME), {content});

    assert(loadRuleSpec({dir, rule})).to.emitSequence([null]);
    assert(spyParse).to.haveBeenCalledWith(content);
  });

  should(`throw error if the file is invalid`, () => {
    const dir = 'dir';
    const rule = 'rule';
    const content = 'content';

    const spyParse = spy(yaml, 'parse');
    fake(spyParse).always().return({blah: {}});

    addFile(path.join(dir, CONFIG_NAME), {content});

    assert(
        loadRuleSpec({dir, rule})
            .pipe(catchError((err: Error) => observableOf(err.message))),
    ).to.emitSequence([match.anyStringThat().match(/valid config file/)]);
    assert(spyParse).to.haveBeenCalledWith(content);
  });
});
