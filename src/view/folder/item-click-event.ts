export const ITEM_CLICK_EVENT = 'th-item-click';

export class ItemClickEvent extends CustomEvent<string> {
  constructor(readonly itemId: string) {
    super(ITEM_CLICK_EVENT, {bubbles: true, detail: itemId});
  }
}
