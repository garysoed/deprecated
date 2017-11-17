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

import { Previewer } from 'src/main/previewer';
import { $items, ItemImpl, ItemType } from '../data';
import { DriveSearch } from '../main/drive-search';
import { Navigator } from '../main/navigator';
import { $selectedItem } from '../main/selected-folder-graph';

export enum ContentType {
  ADD,
  NAVIGATE,
  PREVIEW,
}

function contentSwitchFactory(document: Document, type: ContentType): HTMLElement {
  switch (type) {
    case ContentType.ADD:
      return document.createElement('th-drive-search');
    case ContentType.NAVIGATE:
      return document.createElement('th-navigator');
    case ContentType.PREVIEW:
      return document.createElement('th-previewer');
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
        EnumType(ContentType),
        ContentType.NAVIGATE),
  },
});

const $contentType = instanceId('contentType', EnumType(ContentType));
const $contentTypeProvider = Graph.createProvider($contentType, ContentType.NAVIGATE);

@component({
  dependencies: [DriveSearch, Navigator, Previewer],
  tag: 'th-root-view',
  templateKey: 'src/main/root-view',
})
export class RootView extends BaseThemedElement2 {
  constructor(@inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
  }

  @onDom.event($.content.el, 'th-add')
  onContentAdd_(): void {
    $contentTypeProvider(ContentType.ADD, this);
  }

  @onDom.event($.content.el, 'th-item-added')
  onContentItemAdded_(): void {
    $contentTypeProvider(ContentType.NAVIGATE, this);
  }

  @render.switch($.content.switch)
  renderContentSwitch_(
      @nodeIn($contentType) contentType: ContentType,
      @nodeIn($selectedItem) selectedItem: ItemImpl | null): ContentType {
    if (!selectedItem) {
      return contentType;
    }
    return selectedItem.getType() === ItemType.RENDER ? ContentType.PREVIEW : contentType;
  }

  @render.attribute($.breadcrumb.crumb)
  async renderCrumbs_(
      @nodeIn($selectedItem) selectedItem: ItemImpl | null,
      @nodeIn($items) items: DataGraph<ItemImpl>):
      Promise<ImmutableList<CrumbData>> {
    const itemArray: ItemImpl[] = [];
    let current: ItemImpl | null = selectedItem;
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
