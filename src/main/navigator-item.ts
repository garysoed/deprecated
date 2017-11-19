import {
  ElementWithTagType,
  InstanceofType,
  NullableType,
  StringType } from 'external/gs_tools/src/check';
import { DataGraph } from 'external/gs_tools/src/datamodel';
import { Errors } from 'external/gs_tools/src/error';
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

import {
  $items,
  DriveFile,
  DriveFolder,
  DriveService,
  FileImpl,
  FileType,
  Item,
  ItemService} from '../data';
import { RenderService } from '../render';

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
  refreshButton: {
    el: elementSelector('#refreshButton', ElementWithTagType('gs-basic-button')),
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

  @onDom.event($.previewButton.el, 'click')
  @onDom.event($.refreshButton.el, 'click')
  onActionButtonClick_(event: MouseEvent): void {
    event.stopPropagation();
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

  @onDom.event($.previewButton.el, 'gs-action')
  async onPreviewButtonAction_(event: MouseEvent): Promise<void> {
    event.stopPropagation();

    const time = Graph.getTimestamp();
    const item = await Graph.get($item, time, this);
    if (!(item instanceof FileImpl)) {
      return;
    }

    RenderService.render(item.getId(), time);
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

    const files = await DriveService.recursiveGet(item.getDriveId(), parentId);
    files.mapItem((file) => ItemService.save(time, file));
  }

  @nodeOut($item)
  providesItem(
      @nodeIn($.host.itemid.getId()) itemId: string,
      @nodeIn($items) itemsGraph: DataGraph<Item>): Promise<Item | null> {
    return itemsGraph.get(itemId);
  }

  @render.innerText($.icon.innerText)
  renderIcon_(
      @nodeIn($item) item: Item | null): string {
    if (!item) {
      return '';
    }

    if (item instanceof FileImpl) {
      switch (item.getType()) {
        case FileType.ASSET:
          return 'web';
        case FileType.RENDER:
          return 'palette';
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
}
