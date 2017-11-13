import { assert, Mocks, TestBase, TestDispose } from '../test-base';
TestBase.setup();

import { ItemType } from '../data';
import { DriveFile } from '../data/drive-file';
import { PreviewFile } from '../data/preview-file';
import { Previewer } from '../main/previewer';


describe('main.Previewer', () => {
  let previewer: Previewer;

  beforeEach(() => {
    previewer = new Previewer(Mocks.object('ThemeService'));
    TestDispose.add(previewer);
  });

  describe('renderPreviewSrcDoc_', () => {
    it(`should return the correct content`, () => {
      const content = 'content';
      const selectedItem = PreviewFile.newInstance('id', 'name', 'parentId', content, 'originalId');

      assert(previewer.renderPreviewSrcDoc_(selectedItem)).to.equal(content);
    });

    it(`should return empty string if the selected item is not a preview file`, () => {
      const selectedItem = DriveFile
          .newInstance('id', 'name', 'parentId', ItemType.ASSET, 'content');

      assert(previewer.renderPreviewSrcDoc_(selectedItem)).to.equal('');
    });
  });
});
