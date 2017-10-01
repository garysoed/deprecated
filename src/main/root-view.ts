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
import { $location } from 'external/gs_tools/src/ui';
import { BaseThemedElement2 } from 'external/gs_ui/src/common';

import { CrumbData } from 'external/gs_ui/src/routing';
import { ThemeService } from 'external/gs_ui/src/theming';

import { Folder } from '../data/folder';
import { Item } from '../data/item';
import { $selectedFolder } from '../main/selected-folder-graph';

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
  renderCrumbs_(@nodeIn($selectedFolder) folder: Folder): ImmutableList<CrumbData> {
    const crumbs: CrumbData[] = [];
    let current: Item | null = folder;
    while (current) {
      crumbs.push({name: current.name, url: current.path});
      current = current.parent;
    }
    return ImmutableList.of(crumbs).reverse();
  }
}
