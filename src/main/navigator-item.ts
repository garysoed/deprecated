import {
  BooleanType,
  ElementWithTagType,
  InstanceofType,
  NullableType,
  StringType} from 'external/gs_tools/src/check';
import { DataGraph } from 'external/gs_tools/src/datamodel';
import { Errors } from 'external/gs_tools/src/error';
import { $time, Graph, GraphTime, instanceId, nodeIn, nodeOut } from 'external/gs_tools/src/graph';
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
    shadowHostSelector} from 'external/gs_tools/src/persona';
import { $location, navigateToHash } from 'external/gs_tools/src/ui';

import { BaseThemedElement2 } from 'external/gs_ui/src/common';
import { ThemeService } from 'external/gs_ui/src/theming';

import {
  $items,
  DriveFile,
  DriveFolder,
  DriveService,
  File,
  FileType,
  Item,
  ItemService,
  ThothFolder} from '../data';
import { RenderService } from '../render';

export const $ = resolveSelectors({
  host: {
    deleteable: attributeSelector(
        elementSelector('host.el'),
        'deleteable',
        BooleanParser,
        BooleanType,
        false),
    el: shadowHostSelector,
    itemid: attributeSelector(
        elementSelector('host.el'),
        'itemid',
        StringParser,
        StringType,
        ''),
    refreshable: attributeSelector(
        elementSelector('host.el'),
        'refreshable',
        BooleanParser,
        BooleanType,
        false),
    viewable: attributeSelector(
        elementSelector('host.el'),
        'viewable',
        BooleanParser,
        BooleanType,
        false),
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
  refreshButton: {
    el: elementSelector('#refreshButton', ElementWithTagType('gs-basic-button')),
  },
  renderButton: {
    el: elementSelector('#renderButton', ElementWithTagType('gs-basic-button')),
  },
});

export const $item = instanceId('item', NullableType(InstanceofType(Item)));

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

  @onDom.event($.renderButton.el, 'click')
  @onDom.event($.refreshButton.el, 'click')
  onActionButtonClick_(event: MouseEvent): void {
    event.stopPropagation();
  }

  @onDom.event($.host.el, 'click')
  async onHostClick_(): Promise<void> {
    const time = Graph.getTimestamp();
    const [item, path] = await Promise.all([
      Graph.get($item, time, this),
      Graph.get($location.path, time),
    ]);
    if (!item) {
      return;
    }

    navigateToHash(`${path}/${item.getName()}`);
  }

  @onDom.event($.refreshButton.el, 'gs-action')
  async onRefreshButtonAction_(event: MouseEvent): Promise<void> {
    event.stopPropagation();

    const time = Graph.getTimestamp();
    const item = await Graph.get($item, time, this);
    if (!(item instanceof DriveFile) && !(item instanceof DriveFolder)) {
      return;
    }

    const parentId = item.getParentId();
    if (!parentId) {
      throw Errors.assert('parentId').shouldExist().butWas(parentId);
    }

    const files = await DriveService.recursiveGet(item.getDriveId(), parentId, time);
    files.mapItem((file) => ItemService.save(time, file));
  }

  @onDom.event($.renderButton.el, 'gs-action')
  async onRenderButtonAction_(event: MouseEvent): Promise<void> {
    event.stopPropagation();

    const time = Graph.getTimestamp();
    const item = await Graph.get($item, time, this);
    if (item === null) {
      return;
    }

    RenderService.render(item.getId(), time);
  }

  @nodeOut($item)
  providesItem(
      @nodeIn($.host.itemid.getId()) itemId: string,
      @nodeIn($items) itemsGraph: DataGraph<Item>): Promise<Item | null> {
    return itemsGraph.get(itemId);
  }

  @render.attribute($.host.deleteable)
  async renderDeleteable_(
      @nodeIn($item) item: Item | null,
      @nodeIn($time) time: GraphTime): Promise<boolean> {
    if (!item) {
      return false;
    }

    const parentId = item.getParentId();
    if (!parentId) {
      return false;
    }

    const parent = await ItemService.getItem(parentId, time);
    return parent instanceof ThothFolder;
  }

  @render.innerText($.icon.innerText)
  renderIcon_(@nodeIn($item) item: Item | null): string {
    if (!item) {
      return '';
    }

    if (item instanceof File) {
      switch (item.getType()) {
        case FileType.ASSET:
          return 'web';
        default:
          return 'help';
      }
    } else {
      if (item instanceof DriveFolder) {
        // TODO: Use special icon.
        return 'folder';
      } else {
        return 'folder';
      }
    }
  }

  @render.innerText($.name.innerText)
  renderName_(@nodeIn($item) item: Item | null): string {
    if (!item) {
      return '';
    }

    return item.getName();
  }

  @render.attribute($.host.refreshable)
  renderRefreshable_(@nodeIn($item) item: Item | null): boolean {
    return item instanceof DriveFile || item instanceof DriveFolder;
  }

  @render.attribute($.host.viewable)
  renderViewable_(@nodeIn($item) item: Item | null): boolean {
    return item instanceof File;
  }
}
