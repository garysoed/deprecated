import { assert, setup, should, test } from '@gs-testing';
import { _p } from '@mask';
import { ElementTester, PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { fromEvent, ReplaySubject } from '@rxjs';
import { map } from '@rxjs/operators';
import { ItemType } from '../../../datamodel/item-type';
import { SourceType } from '../../../datamodel/source-type';
import { ITEM_CLICK_EVENT, ItemClickEvent } from '../item-click-event';
import { $, AddItemDialogItem } from './add-item-dialog-item';

test('@thoth/view/folder/add-item/add-item-dialog-item', () => {
  const factory = new PersonaTesterFactory(_p);

  let el: ElementTester;
  let tester: PersonaTester;

  setup(() => {
    tester = factory.build([AddItemDialogItem]);
    el = tester.createElement('th-add-item-dialog-item', document.body);
  });

  test('renderDispatchItemClick', () => {
    should(`dispatch the correct event`, () => {
      const itemId = 'itemId';
      el.setAttribute($.host._.itemId, itemId).subscribe();

      const replaySubject = new ReplaySubject<ItemClickEvent>(1);
      fromEvent<ItemClickEvent>(el.element, ITEM_CLICK_EVENT).subscribe(replaySubject);

      el.dispatchEvent($.host._.onClick).subscribe();

      assert(replaySubject).to.emit();
      assert(replaySubject.pipe(map(event => event.itemId))).to.emitWith(itemId);
    });
  });

  test('renderIcon', () => {
    should(`render the icon correctly`, () => {
      const itemType = ItemType.CONVERTER;
      const sourceType = SourceType.DRIVE;

      el.setAttribute($.host._.itemType, itemType).subscribe();
      el.setAttribute($.host._.sourceType, sourceType).subscribe();

      assert(el.getAttribute($.item._.icon)).to.emitWith(`${itemType}_${sourceType}`);
    });
  });
});
