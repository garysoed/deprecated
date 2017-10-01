import { assert, TestBase } from '../test-base';
TestBase.setup();

import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { EditableFolder } from '../data/editable-folder';


describe('data.EditableFolder', () => {
  describe('setName', () => {
    it(`should return the folder with the new name`, () => {
      const newName = 'newName';
      const folder = new EditableFolder('id', 'name', '/a/name', ImmutableSet.of([]), null)
          .setName(newName);

      assert(folder.id).to.equal('id');
      assert(folder.name).to.equal(newName);
      assert(folder.path).to.equal(`/a/${newName}`);
    });
  });
});
