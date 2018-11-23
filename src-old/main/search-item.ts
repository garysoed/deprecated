import {
  BooleanType,
  InstanceofType,
  StringType } from 'external/gs_tools/src/check';
import { Graph, instanceId, nodeIn } from 'external/gs_tools/src/graph';
import { inject } from 'external/gs_tools/src/inject';
import { BooleanParser, StringParser } from 'external/gs_tools/src/parse';
import {
  attributeSelector,
  component,
  elementSelector,
  innerTextSelector,
  onDom,
  render,
  resolveSelectors,
  shadowHostSelector } from 'external/gs_tools/src/persona';

import { BaseThemedElement2 } from 'external/gs_ui/src/common';
import { ThemeService } from 'external/gs_ui/src/theming';

const $ = resolveSelectors({
  content: {
    el: elementSelector('#content', InstanceofType(HTMLDivElement)),
    innerText: innerTextSelector(
        elementSelector('content.el'),
        StringParser,
        StringType,
        ''),
  },
  host: {
    el: shadowHostSelector,
    selected: attributeSelector(
        elementSelector('host.el'),
        'selected',
        BooleanParser,
        BooleanType,
        false),
    text: attributeSelector(
        elementSelector('host.el'),
        'text',
        StringParser,
        StringType,
        ''),
  },
});

export const $selected = instanceId('selected', BooleanType);
export const selectedProvider = Graph.createProvider($selected, false);

@component({
  inputs: [
    $.host.text,
  ],
  tag: 'th-search-item',
  templateKey: 'src/main/search-item',
})
export class SearchItem extends BaseThemedElement2 {
  constructor(@inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
  }

  @onDom.event($.host.el, 'click')
  async onElementClick_(): Promise<void> {
    const selected = await Graph.get($selected, Graph.getTimestamp(), this);
    await selectedProvider(!selected, this);
  }

  @render.innerText($.content.innerText)
  renderInnerText_(@nodeIn($.host.text.getId()) text: string): string {
    return text;
  }

  @render.attribute($.host.selected)
  renderSelected_(@nodeIn($selected) selected: boolean): boolean {
    return selected;
  }
}
