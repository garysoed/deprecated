import { assert, runEnvironment, setup, should, test } from '@gs-testing';
import { _p } from '@mask';
import { PersonaTester, PersonaTesterEnvironment, PersonaTesterFactory } from '@persona/testing';
import { fromEvent, ReplaySubject } from '@rxjs';
import { map } from '@rxjs/operators';
import { ItemType } from '../../datamodel/item-type';
import { SourceType } from '../../datamodel/source-type';
import { $, FileListItem } from './file-list-item';
import { ITEM_CLICK_EVENT, ItemClickEvent } from './item-click-event';

test('@thoth/view/folder/file-list-item', () => {
  runEnvironment(new PersonaTesterEnvironment());

  const factory = new PersonaTesterFactory(_p);

  let el: HTMLElement;
  let tester: PersonaTester;

  setup(() => {
    tester = factory.build([FileListItem]);
    el = tester.createElement('th-file-list-item', document.body);
  });

  test('renderDispatchItemClick', () => {
    should(`dispatch the correct event`, () => {
      const itemId = 'itemId';
      tester.setAttribute(el, $.host._.itemId, itemId).subscribe();

      const replaySubject = new ReplaySubject<ItemClickEvent>(1);
      fromEvent<ItemClickEvent>(el, ITEM_CLICK_EVENT).subscribe(replaySubject);

      tester.dispatchEvent(el, $.host._.onClick).subscribe();

      assert(replaySubject).to.emit();
      assert(replaySubject.pipe(map(event => event.itemId))).to.emitWith(itemId);
    });
  });

  test('renderIcon', () => {
    should(`render the icon correctly`, () => {
      const itemType = ItemType.CONVERTER;
      const sourceType = SourceType.DRIVE;

      tester.setAttribute(el, $.host._.itemType, itemType).subscribe();
      tester.setAttribute(el, $.host._.sourceType, sourceType).subscribe();

      assert(tester.getAttribute(el, $.item._.icon)).to.emitWith(`${itemType}_${sourceType}`);
    });
  });
});
