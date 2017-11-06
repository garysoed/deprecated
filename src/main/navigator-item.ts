import {
  ElementWithTagType,
  InstanceofType,
  NullableType,
  StringType } from 'external/gs_tools/src/check';
import { DataGraph } from 'external/gs_tools/src/datamodel';
import { Graph, instanceId, nodeIn, nodeOut } from 'external/gs_tools/src/graph';
import { inject } from 'external/gs_tools/src/inject';
import { StringParser } from 'external/gs_tools/src/parse';
import {
    attributeSelector,
    component,
    elementSelector,
    innerTextSelector,
    onDom,
    render,
    resolveSelectors,
    shadowHostSelector} from 'external/gs_tools/src/persona';

import { navigateToHash } from 'external/gs_tools/src/ui';
import { BaseThemedElement2 } from 'external/gs_ui/src/common';
import { ThemeService } from 'external/gs_ui/src/theming';

import { $items } from '../data/item-graph';
import { ItemImpl } from '../data/item-impl';
import { ItemType } from '../data/item-type';

export const $ = resolveSelectors({
  host: {
    el: shadowHostSelector,
    itemid: attributeSelector(
        elementSelector('host.el'),
        'itemid',
        StringParser,
        StringType,
        ''),
  },
  icon: {
    el: elementSelector('#icon', ElementWithTagType('gs-icon')),
    innerText: innerTextSelector(
        elementSelector('icon.el'),
        StringParser,
        StringType,
        ''),
  },
  name: {
    el: elementSelector('#name', InstanceofType(HTMLDivElement)),
    innerText: innerTextSelector(
        elementSelector('name.el'),
        StringParser,
        StringType,
        ''),
  },
  previewButton: {
    el: elementSelector('#previewButton', ElementWithTagType('gs-basic-button')),
  },
});

export const $item = instanceId('item', NullableType(InstanceofType(ItemImpl)));

@component({
  inputs: [
    $.host.itemid,
  ],
  tag: 'th-navigator-item',
  templateKey: 'src/main/navigator-item',
})
export class NavigatorItem extends BaseThemedElement2 {
  constructor(@inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
  }

  @onDom.event($.host.el, 'click')
  async onHostClick_(): Promise<void> {
    const time = Graph.getTimestamp();
    const item = await Graph.get($item, time, this);
    if (!item) {
      return;
    }

    navigateToHash(item.getId());
  }

  @onDom.event($.previewButton.el, 'click')
  onPreviewButtonClick_(event: MouseEvent): void {
    event.stopPropagation();
  }

  @nodeOut($item)
  providesItem(
      @nodeIn($.host.itemid.getId()) itemId: string,
      @nodeIn($items) itemsGraph: DataGraph<ItemImpl>): Promise<ItemImpl | null> {
    return itemsGraph.get(itemId);
  }

  @render.innerText($.icon.innerText)
  renderIcon_(
      @nodeIn($item) item: ItemImpl | null): string {
    if (!item) {
      return '';
    }

    switch (item.getType()) {
      case ItemType.FOLDER:
        return 'folder';
      case ItemType.FILE:
        return 'web';
      case ItemType.UNHANDLED_FILE:
        return 'insert_drive_file';
      default:
        return 'help';
    }
  }

  @render.innerText($.name.innerText)
  renderName_(
      @nodeIn($item) item: ItemImpl | null): string {
    if (!item) {
      return '';
    }

    return item.getName();
  }
}
