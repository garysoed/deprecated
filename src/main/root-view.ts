import {
  ElementWithTagType,
  HasPropertiesType,
  IterableOfType,
  StringType } from 'external/gs_tools/src/check';
import { eventDetails, on } from 'external/gs_tools/src/event';
import { Graph, GraphEvent, nodeIn } from 'external/gs_tools/src/graph';
import { ImmutableList } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import { ListParser, ObjectParser, StringParser } from 'external/gs_tools/src/parse';
import {
  attributeSelector,
  component,
  elementSelector,
  Persona,
  render,
  resolveSelectors } from 'external/gs_tools/src/persona';
import { $location, Locations } from 'external/gs_tools/src/ui';
import { BaseThemedElement2 } from 'external/gs_ui/src/common';

import { CrumbData } from 'external/gs_ui/src/routing';
import { ThemeService } from 'external/gs_ui/src/theming';

export const $ = resolveSelectors({
  breadcrumb: {
    crumb: attributeSelector(
        elementSelector('breadcrumb.el'),
        'crumb',
        ListParser(ObjectParser({name: StringParser, url: StringParser})),
        IterableOfType<CrumbData, ImmutableList<CrumbData>>(
            HasPropertiesType({name: StringType, url: StringType})),
        ImmutableList.of([]),
    ),
    el: elementSelector('#breadcrumb', ElementWithTagType('gs-breadcrumb')),
  },
});

@component({
  tag: 'th-root-view',
  templateKey: 'src/main/root-view',
})
export class RootView extends BaseThemedElement2 {
  constructor(@inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
  }

  @on(Graph, 'change')
  onLocationChange_(@eventDetails() event: GraphEvent<string, null>): void {
    if (event.id !== $location.path) {
      return;
    }

    Persona.updateValue($.breadcrumb.crumb, this);
  }

  @render.attribute($.breadcrumb.crumb)
  renderCrumbs_(@nodeIn($location.path) path: string): ImmutableList<CrumbData> {
    let url = '';
    const crumbs: CrumbData[] = [];
    for (const part of Locations.normalizePath(path).split('/')) {
      url = url[url.length - 1] === '/' ? `${url}${part}` : `${url}/${part}`;
      if (part === '') {
        crumbs.push({name: '(root)', url});
      } else {
        crumbs.push({name: part, url});
      }
    }
    return ImmutableList.of(crumbs);
  }
}
