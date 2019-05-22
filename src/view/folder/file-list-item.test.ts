import { assert, setup, should, test } from '@gs-testing';
import { _p } from '@mask';
import { PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { ItemType } from '../../datamodel/item-type';
import { SourceType } from '../../datamodel/source-type';
import { $, FileListItem } from './file-list-item';

test('@thoth/view/folder/file-list-item', () => {
  const factory = new PersonaTesterFactory(_p);

  let el: HTMLElement;
  let tester: PersonaTester;

  setup(() => {
    tester = factory.build([FileListItem]);
    el = tester.createElement('th-file-list-item', document.body);
  });

  test('renderIcon', () => {
    should(`render the icon correctly`, async () => {
      const itemType = ItemType.CONVERTER;
      const sourceType = SourceType.DRIVE;

      tester.setAttribute(el, $.host._.itemType, itemType).subscribe();
      tester.setAttribute(el, $.host._.sourceType, sourceType).subscribe();

      await assert(tester.getAttribute(el, $.item._.icon)).to.emitWith(`${itemType}_${sourceType}`);
    });
  });
});
