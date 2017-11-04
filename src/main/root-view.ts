import {
  ElementWithTagType,
  EnumType,
  HasPropertiesType,
  IterableOfType,
  StringType } from 'external/gs_tools/src/check';
import { DataGraph } from 'external/gs_tools/src/datamodel';
import { Graph, instanceId, nodeIn } from 'external/gs_tools/src/graph';
import { ImmutableList } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import { ListParser, ObjectParser, StringParser } from 'external/gs_tools/src/parse';
import {
  attributeSelector,
  component,
  elementSelector,
  onDom,
  render,
  resolveSelectors,
  slotSelector,
  switchSelector } from 'external/gs_tools/src/persona';

import { BaseThemedElement2 } from 'external/gs_ui/src/common';
import { CrumbData } from 'external/gs_ui/src/routing';
import { ThemeService } from 'external/gs_ui/src/theming';

import { FolderImpl } from '../data/folder-impl';
import { $items } from '../data/item-graph';
import { ItemImpl } from '../data/item-impl';
import { DriveSearch } from '../main/drive-search';
import { Navigator } from '../main/navigator';
import { $selectedFolder } from '../main/selected-folder-graph';

enum ContentTypes {
  ADD,
  NAVIGATE,
}

function contentSwitchFactory(document: Document, type: ContentTypes): HTMLElement {
  switch (type) {
    case ContentTypes.ADD:
      return document.createElement('th-drive-search');
    case ContentTypes.NAVIGATE:
      return document.createElement('th-navigator');
  }

  throw new Error('unimplemented');
}

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
  content: {
    el: elementSelector('#content', ElementWithTagType('section')),
    switch: switchSelector(
        contentSwitchFactory,
        slotSelector(elementSelector('content.el'), 'content'),
        EnumType(ContentTypes),
        ContentTypes.NAVIGATE),
  },
});

const $contentType = instanceId('contentType', EnumType(ContentTypes));
const $contentTypeProvider = Graph.createProvider($contentType, ContentTypes.NAVIGATE);

@component({
  dependencies: [DriveSearch, Navigator],
  tag: 'th-root-view',
  templateKey: 'src/main/root-view',
})
export class RootView extends BaseThemedElement2 {
  constructor(@inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
  }

  @onDom.event($.content.el, 'th-add')
  onContentAdd_(): void {
    $contentTypeProvider(ContentTypes.ADD, this);
  }

  @render.switch($.content.switch)
  renderContentSwitch_(@nodeIn($contentType) contentType: ContentTypes): ContentTypes {
    return contentType;
  }

  @render.attribute($.breadcrumb.crumb)
  async renderCrumbs_(
      @nodeIn($selectedFolder) folder: FolderImpl,
      @nodeIn($items) items: DataGraph<ItemImpl>):
      Promise<ImmutableList<CrumbData>> {
    const itemArray: ItemImpl[] = [];
    let current: ItemImpl | null = folder;
    while (current) {
      itemArray.push(current);
      const parentId: string | null = current.getParentId();
      current = await (parentId ? items.get(parentId) : Promise.resolve(null));
    }
    const crumbs: CrumbData[] = [];
    let path = '';
    for (const item of ImmutableList.of(itemArray).reverse()) {
      path += `/${item.getName()}`;
      crumbs.push({name: item.getName(), url: path});
    }
    return ImmutableList.of(crumbs);
  }
}
