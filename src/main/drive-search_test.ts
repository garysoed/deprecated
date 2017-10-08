import { assert, Mocks, TestBase, TestDispose } from '../test-base';
TestBase.setup();

import { Graph } from 'external/gs_tools/src/graph';
import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { DriveStorage } from '../import/drive-storage';
import { $driveItems, DriveSearch } from '../main/drive-search';

describe('main.DriveSearch', () => {
  let search: DriveSearch;

  beforeEach(() => {
    search = new DriveSearch(Mocks.object('ThemeService'));
    TestDispose.add(search);
  });

  describe('onInputChange_', () => {
    it(`should update the provider correctly`, async () => {
      const name1 = 'name1';
      const name2 = 'name2';
      spyOn(DriveStorage, 'list').and
          .returnValue(Promise.resolve(ImmutableSet.of([{name: name1}, {name: name2}])));

      await search.onInputChange_();
      const items = await Graph.get($driveItems, Graph.getTimestamp(), search);
      assert([...items]).to.equal([name1, name2]);
    });
  });
});
