import {
  TestAsync,
  TestDispose,
  TestInject,
  TestJasmine,
  TestSetup } from 'external/gs_tools/src/testing';
import { Log } from 'external/gs_tools/src/util';
import { LogLevel } from 'external/gs_tools/src/util/log';

export { assert, assertColor, Matchers } from 'external/gs_tools/src/jasmine';
export { Fakes, Mocks } from 'external/gs_tools/src/mock';
export { TestDispose, TestGraph } from 'external/gs_tools/src/testing';

const TEST_SETUP = new TestSetup([
  TestAsync,
  TestDispose,
  TestInject,
  TestJasmine,
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
