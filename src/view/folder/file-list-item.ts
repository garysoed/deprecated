import { ElementWithTagType } from '@gs-types';
import { $listItem, enumParser, ListItem, stringParser, ThemedCustomElementCtrl, _p, _v } from '@mask';
import { api, attributeIn, dispatcher, element, InitFn, onDom } from '@persona';
import { combineLatest, Observable } from '@rxjs';
import { map, withLatestFrom } from '@rxjs/operators';
import { ItemType } from '../../datamodel/item-type';
import { SourceType } from '../../datamodel/source-type';
import template from './file-list-item.html';
import { ItemClickEvent, ITEM_CLICK_EVENT } from './item-click-event';

export const $$ = {
  dispatchItemClick: dispatcher<ItemClickEvent>(ITEM_CLICK_EVENT),
  itemId: attributeIn('item-id', stringParser()),
  itemType: attributeIn('item-type', enumParser(ItemType), ItemType.UNKNOWN),
  label: attributeIn('label', stringParser()),
  onClick: onDom('click'),
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
  tag: 'th-file-list-item',
  template,
})
export class FileListItem extends ThemedCustomElementCtrl {
  private readonly itemIdObs = _p.input($.host._.itemId, this);
  private readonly itemTypeObs = _p.input($.host._.itemType, this);
  private readonly labelObs = _p.input($.host._.label, this);
  private readonly onClick = _p.input($.host._.onClick, this);
  private readonly sourceTypeObs = _p.input($.host._.sourceType, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.item._.itemName).withObservable(this.labelObs),
      _p.render($.item._.icon).withVine(_v.stream(this.renderIcon, this)),
      _p.render($.host._.dispatchItemClick).withVine(_v.stream(this.renderDispatchItemClick, this)),
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
    return combineLatest(this.itemTypeObs, this.sourceTypeObs)
        .pipe(
            map(([itemType, sourceType]) => `${itemType}_${sourceType}`),
        );
  }
}
