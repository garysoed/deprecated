import { ElementWithTagType, NonNullType, StringType } from 'external/gs_tools/src/check';
import { nodeIn } from 'external/gs_tools/src/graph';
import { ImmutableList, Orderings } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import {
  childrenSelector,
  component,
  dispatcherSelector,
  elementSelector,
  onDom,
  Persona,
  render,
  resolveSelectors,
  shadowHostSelector,
  slotSelector } from 'external/gs_tools/src/persona';

import { BaseThemedElement2 } from 'external/gs_ui/src/common';
import { ThemeService } from 'external/gs_ui/src/theming';

import { $itemService, $selectedItem, DataFile, Folder, Item, ItemService, MarkdownFile, MetadataFile, UnknownFile } from '../data';
import { NavigatorItem } from '../main/navigator-item';

export function itemsFactory(document: Document): HTMLElement {
  return document.createElement('th-navigator-item');
}

export function itemsGetter(element: HTMLElement): string {
  return element.getAttribute('itemid') || '';
}

export function itemsSetter(value: string, element: HTMLElement): void {
  element.setAttribute('itemid', value);
}

export const $ = resolveSelectors({
  addButton: {
    el: elementSelector('#addButton', ElementWithTagType('gs-basic-button')),
  },
  host: {
    dispatch: dispatcherSelector<null>(elementSelector('host.el')),
    el: shadowHostSelector,
  },
  items: {
    children: childrenSelector(
        slotSelector(elementSelector('items.el'), 'items'),
        itemsFactory,
        itemsGetter,
        itemsSetter,
        StringType,
        ElementWithTagType('th-navigator-item')),
    el: elementSelector('#items', ElementWithTagType('section')),
  },
});

@component({
  dependencies: [
    NavigatorItem,
  ],
  inputs: [
    $.host.dispatch,
  ],
  tag: 'th-navigator',
  templateKey: 'src/main/navigator',
})
export class Navigator extends BaseThemedElement2 {
  constructor(@inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
  }

  @onDom.event($.addButton.el, 'click')
  onAddClick_(): void {
    const dispatcher = Persona.getValue($.host.dispatch, this);
    if (!dispatcher) {
      return;
    }

    dispatcher('th-add', null);
  }

  @render.children($.items.children)
  async renderItems_(
      @nodeIn($itemService) itemService: ItemService,
      @nodeIn($selectedItem) selectedItem: Item | null): Promise<ImmutableList<string>> {
    if (!(selectedItem instanceof Folder)) {
      return createImmutableList([]);
    }

    const itemsPromise = selectedItem
        .getItems()
        .mapItem(itemId => itemService.getItem(itemId))
        .filterByType(NonNullType<Item>());
    const items = createImmutableList(await Promise.all(itemsPromise));
    return items
        .sort(Orderings.compound([
          Orderings.matches(item => item instanceof Folder),
          Orderings.matches((item) => {
            return item instanceof MarkdownFile ||
                item instanceof DataFile ||
                item instanceof MetadataFile;
          }),
          Orderings.matches(item => !(item instanceof UnknownFile)),
          Orderings.map(item => item.getName(), Orderings.natural()),
        ]))
        .mapItem(item => item.getId());
  }
}
