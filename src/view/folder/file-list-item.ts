import { ElementWithTagType } from '@gs-types';
import { $listItem, _p, _v, enumParser, ListItem, stringParser, ThemedCustomElementCtrl } from '@mask';
import { api, attributeIn, element, InitFn } from '@persona';
import { combineLatest, Observable } from '@rxjs';
import { map } from '@rxjs/operators';
import { ItemType } from '../../datamodel/item-type';
import { SourceType } from '../../datamodel/source-type';
import template from './file-list-item.html';

export const $ = {
  host: element({
    itemType: attributeIn('item-type', enumParser(ItemType), ItemType.UNKNOWN),
    label: attributeIn('label', stringParser()),
    sourceType: attributeIn('source-type', enumParser(SourceType), SourceType.LOCAL),
  }),
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
  private readonly itemTypeObs = _p.input($.host._.itemType, this);
  private readonly labelObs = _p.input($.host._.label, this);
  private readonly sourceTypeObs = _p.input($.host._.sourceType, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.item._.itemName).withObservable(this.labelObs),
      _p.render($.item._.icon).withVine(_v.stream(this.renderIcon, this)),
    ];
  }

  private renderIcon(): Observable<string> {
    return combineLatest(this.itemTypeObs, this.sourceTypeObs)
        .pipe(
            map(([itemType, sourceType]) => `${itemType}_${sourceType}`),
        );
  }
}
