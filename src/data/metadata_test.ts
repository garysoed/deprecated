import { assert, Mocks, TestBase } from '../test-base';
TestBase.setup();

import { ImmutableMap } from 'external/gs_tools/src/immutable';

import { Paths } from 'external/gs_tools/src/path';
import { Metadata } from '../data';


describe('data.Metadata', () => {
  describe('getDefaultShowdownConfig', () => {
    it(`should return the correct value`, () => {
      const config = Mocks.object('config');
      const metadata = new Metadata(
          ImmutableMap.of([]),
          ImmutableMap.of([['$default', config], ['a', Mocks.object('other')]]),
          ImmutableMap.of([]));

      assert(metadata.getDefaultShowdownConfig()).to.equal(config);
    });

    it(`should return null if there are no defaults`, () => {
      const config = Mocks.object('config');
      const metadata = new Metadata(
          ImmutableMap.of([]),
          ImmutableMap.of([['a', config]]),
          ImmutableMap.of([]));

      assert(metadata.getDefaultShowdownConfig()).to.beNull();
    });
  });

  describe('getDefaultTemplatePath', () => {
    it(`should return the correct path`, () => {
      const path = Paths.absolutePath('/a/b');
      const metadata = new Metadata(
          ImmutableMap.of([]),
          ImmutableMap.of([]),
          ImmutableMap.of([['$default', path], ['a', Paths.absolutePath('/other')]]));

      assert(metadata.getDefaultTemplatePath()).to.equal(path);
    });

    it(`should return null if there are no defaults`, () => {
      const path = Paths.absolutePath('/a/b');
      const metadata = new Metadata(
          ImmutableMap.of([]),
          ImmutableMap.of([]),
          ImmutableMap.of([['a', path]]));

      assert(metadata.getDefaultTemplatePath()).to.beNull();
    });
  });

  describe('getShowdownConfigForPath', () => {
    it(`should return te correct showdown config`, () => {
      const metadata = new Metadata(
          ImmutableMap.of([]),
          ImmutableMap.of([
            ['$default', ImmutableMap.of([['a', '1'], ['b', '2']])],
            ['/path', ImmutableMap.of([['a', '2']])],
          ]),
          ImmutableMap.of([]));

      assert(metadata.getShowdownConfigForPath(Paths.absolutePath('/path')))
          .to.haveElements([['a', '2'], ['b', '2']]);
    });

    it(`should return default value if the entry does not exist`, () => {
      const metadata = new Metadata(
          ImmutableMap.of([]),
          ImmutableMap.of([
            ['$default', ImmutableMap.of([['a', '1'], ['b', '2']])],
          ]),
          ImmutableMap.of([]));

      assert(metadata.getShowdownConfigForPath(Paths.absolutePath('/path')))
          .to.haveElements([['a', '1'], ['b', '2']]);
    });

    it(`should return empty map if the entry does not exist`, () => {
      const metadata = new Metadata(
          ImmutableMap.of([]),
          ImmutableMap.of([]),
          ImmutableMap.of([]));

      assert(metadata.getShowdownConfigForPath(Paths.absolutePath('/path'))).to.haveElements([]);
    });
  });
});
