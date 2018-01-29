import { TestGraph } from 'external/gs_tools/src/graph';
import { IterableMatcher } from 'external/gs_tools/src/immutable/testing';
import { PathMatcher } from 'external/gs_tools/src/path/testing';
import {
  TestAsync,
  TestDispose,
  TestInject,
  TestJasmine,
  TestSetup } from 'external/gs_tools/src/testing';
import { Log } from 'external/gs_tools/src/util';
import { LogLevel } from 'external/gs_tools/src/util/log';

export { TestGraph } from 'external/gs_tools/src/graph';
export { assert, assertColor, Matchers } from 'external/gs_tools/src/jasmine';
export { Fakes, Mocks } from 'external/gs_tools/src/mock';
export { TestDispose } from 'external/gs_tools/src/testing';
export { PathMatcher } from 'external/gs_tools/src/path/testing';
export { IterableMatcher } from 'external/gs_tools/src/immutable/testing';

const TEST_SETUP = new TestSetup([
  TestAsync,
  TestGraph,
  TestDispose,
  TestInject,
  TestJasmine,
  IterableMatcher.testSetup,
  PathMatcher.testSetup,
]);

let initialized = false;

export const TestBase = {
  setup(): void {
    if (!initialized) {
      TEST_SETUP.setup();
      Log.setEnabledLevel(LogLevel.OFF);
      initialized = true;
    }
  },
};
