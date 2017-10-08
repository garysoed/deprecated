import { ElementWithTagType } from 'external/gs_tools/src/check';
import { inject } from 'external/gs_tools/src/inject';
import {
  component,
  dispatcherSelector,
  elementSelector,
  onDom,
  Persona,
  resolveSelectors,
  shadowHostSelector } from 'external/gs_tools/src/persona';

import { BaseThemedElement2 } from 'external/gs_ui/src/common';
import { ThemeService } from 'external/gs_ui/src/theming';

export const $ = resolveSelectors({
  addButton: {
    el: elementSelector('#addButton', ElementWithTagType('gs-basic-button')),
  },
  host: {
    dispatch: dispatcherSelector<null>(elementSelector('host.el')),
    el: shadowHostSelector,
  },
});

@component({
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
}
