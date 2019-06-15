import { ElementWithTagType } from '@gs-types';
import { $listItem, _p, _v, enumParser, ListItem, stringParser, ThemedCustomElementCtrl } from '@mask';
import { api, attributeIn, dispatcher, element, hasAttribute, InitFn, onDom } from '@persona';
import { combineLatest, Observable } from '@rxjs';
import { map, withLatestFrom } from '@rxjs/operators';
import { ItemType } from '../../../datamodel/item-type';
import { SourceType } from '../../../datamodel/source-type';
import template from './add-item-dialog-item.html';
import { ITEM_CLICK_EVENT, ItemClickEvent } from './item-click-event';

export const $$ = {
  dispatchItemClick: dispatcher<ItemClickEvent>(ITEM_CLICK_EVENT),
  itemId: attributeIn('item-id', stringParser()),
  itemType: attributeIn('item-type', enumParser(ItemType), ItemType.UNKNOWN),
  label: attributeIn('label', stringParser()),
  onClick: onDom('click'),
  selected: hasAttribute('selected'),
  sourceType: attributeIn('source-type', enumParser(SourceType), SourceType.LOCAL),
};

export const $ = {
  host: element($$),
  item: element('item', ElementWithTagType('mk-list-item'), api($listItem)),
};

@_p.customElement({
  dependencies: [
    ListItem,
  ],
  tag: 'th-add-item-dialog-item',
  template,
})
export class AddItemDialogItem extends ThemedCustomElementCtrl {
  private readonly itemIdObs = _p.input($.host._.itemId, this);
  private readonly itemTypeObs = _p.input($.host._.itemType, this);
  private readonly labelObs = _p.input($.host._.label, this);
  private readonly onClick = _p.input($.host._.onClick, this);
  private readonly selectedObs = _p.input($.host._.selected, this);
  private readonly sourceTypeObs = _p.input($.host._.sourceType, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.item._.itemName).withObservable(this.labelObs),
      _p.render($.item._.icon).withVine(_v.stream(this.renderIcon, this)),
      _p.render($.host._.dispatchItemClick).withVine(_v.stream(this.renderDispatchItemClick, this)),
      _p.render($.item._.selected).withObservable(this.selectedObs),
    ];
  }

  private renderDispatchItemClick(): Observable<ItemClickEvent> {
    return this.onClick
        .pipe(
            withLatestFrom(this.itemIdObs),
            map(([, itemId]) => new ItemClickEvent(itemId)),
        );
  }

  private renderIcon(): Observable<string> {
    return combineLatest([this.itemTypeObs, this.sourceTypeObs])
        .pipe(
            map(([itemType, sourceType]) => `${itemType}_${sourceType}`),
        );
  }
}
