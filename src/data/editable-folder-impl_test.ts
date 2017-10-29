import { assert, TestBase } from '../test-base';
TestBase.setup();

import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { EditableFolderImpl } from '../data/editable-folder-impl';


describe('data.EditableFolderImpl', () => {
  describe('setName', () => {
    it(`should return the folder with the new name`, () => {
      const newName = 'newName';
      const folder = new EditableFolderImpl('id', 'name', '/a/name', ImmutableSet.of([]), null)
          .setName(newName);

      assert(folder.id).to.equal('id');
      assert(folder.name).to.equal(newName);
      assert(folder.path).to.equal(`/a/${newName}`);
    });
  });
});
