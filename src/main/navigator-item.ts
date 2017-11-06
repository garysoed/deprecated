import { InstanceofType, StringType } from 'external/gs_tools/src/check';
import { DataGraph } from 'external/gs_tools/src/datamodel';
import { nodeIn } from 'external/gs_tools/src/graph';
import { inject } from 'external/gs_tools/src/inject';
import { StringParser } from 'external/gs_tools/src/parse';
import {
    attributeSelector,
    component,
    elementSelector,
    innerTextSelector,
    render,
    resolveSelectors,
    shadowHostSelector} from 'external/gs_tools/src/persona';

import { BaseThemedElement2 } from 'external/gs_ui/src/common';
import { ThemeService } from 'external/gs_ui/src/theming';

import { $items } from '../data/item-graph';
import { ItemImpl } from '../data/item-impl';

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
  name: {
    el: elementSelector('#name', InstanceofType(HTMLDivElement)),
    innerText: innerTextSelector(
        elementSelector('name.el'),
        StringParser,
        StringType,
        ''),
  },
});

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

  @render.innerText($.name.innerText)
  async renderName_(
      @nodeIn($.host.itemid.getId()) itemId: string,
      @nodeIn($items) itemsGraph: DataGraph<ItemImpl>): Promise<string> {
    const item = await itemsGraph.get(itemId);
    if (!item) {
      return '';
    }

    return item.getName();
  }
}
