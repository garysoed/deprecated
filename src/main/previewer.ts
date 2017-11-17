import { InstanceofType, StringType } from 'external/gs_tools/src/check';
import { nodeIn } from 'external/gs_tools/src/graph';
import { inject } from 'external/gs_tools/src/inject';
import { StringParser } from 'external/gs_tools/src/parse';
import {
  attributeSelector,
  component,
  elementSelector,
  render,
  resolveSelectors,
  shadowHostSelector} from 'external/gs_tools/src/persona';

import { BaseThemedElement2 } from 'external/gs_ui/src/common';
import { ThemeService } from 'external/gs_ui/src/theming';

import { ItemImpl, PreviewFile } from '../data';
import { $selectedItem } from '../main/selected-folder-graph';

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
  preview: {
    el: elementSelector('#preview', InstanceofType(HTMLIFrameElement)),
    srcdoc: attributeSelector(
        elementSelector('preview.el'),
        'srcdoc',
        StringParser,
        StringType,
        ''),
  },
});

@component({
  inputs: [$.host.itemid],
  tag: 'th-previewer',
  templateKey: 'src/main/previewer',
})
export class Previewer extends BaseThemedElement2 {
  constructor(@inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
  }

  @render.attribute($.preview.srcdoc)
  renderPreviewSrcDoc_(@nodeIn($selectedItem) selectedItem: ItemImpl | null): string {
    if (!(selectedItem instanceof PreviewFile)) {
      return '';
    }

    return selectedItem.getContent();
  }
}
