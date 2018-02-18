import {
  BooleanType,
  ElementWithTagType,
  InstanceofType,
  NullableType,
  StringType } from 'external/gs_tools/src/check';
import { Errors } from 'external/gs_tools/src/error';
import { Graph, instanceId, nodeIn, nodeOut } from 'external/gs_tools/src/graph';
import { inject } from 'external/gs_tools/src/inject';
import { BooleanParser, StringParser } from 'external/gs_tools/src/parse';
import {
    attributeSelector,
    classSelector,
    component,
    elementSelector,
    innerTextSelector,
    onDom,
    Persona,
    render,
    resolveSelectors,
    shadowHostSelector } from 'external/gs_tools/src/persona';
import { $location, navigateToHash } from 'external/gs_tools/src/ui';

import { BaseThemedElement2 } from 'external/gs_ui/src/common';
import { ThemeService } from 'external/gs_ui/src/theming';

import {
  $driveService,
  $itemService,
  DriveFile,
  DriveFolder,
  File,
  FileType,
  Folder,
  Item,
  ItemService,
  ThothFolder } from '../data';
import { $renderService } from '../render';

export const $ = resolveSelectors({
  content: {
    class: {
      editing: classSelector('editing', elementSelector('content.el')),
    },
    el: elementSelector('#content', InstanceofType(HTMLDivElement)),
  },
  deleteButton: {
    el: elementSelector('#deleteButton', ElementWithTagType('gs-basic-button')),
  },
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
  nameInput: {
    el: elementSelector('#nameInput', ElementWithTagType('gs-text-input')),
    value: attributeSelector(
        elementSelector('nameInput.el'),
        'value',
        StringParser,
        StringType,
        ''),
  },
  refreshButton: {
    el: elementSelector('#refreshButton', ElementWithTagType('gs-basic-button')),
  },
  renameButton: {
    el: elementSelector('#renameButton', ElementWithTagType('gs-basic-button')),
  },
  renderButton: {
    el: elementSelector('#renderButton', ElementWithTagType('gs-basic-button')),
  },
});

export const $isEditing = instanceId('isEditing', BooleanType);
const isEditingProvider = Graph.createProvider($isEditing, false);

export const $item = instanceId('item', NullableType(InstanceofType(Item)));
export const $parent = instanceId('parent', NullableType(InstanceofType(Item)));

export const PREVIEW_WINDOW_NAME = 'thoth.PreviewWindow';
export const PREVIEW_PATH_ROOT = '../../preview/main.html';

@component({
  inputs: [
    $.host.itemid,
  ],
  tag: 'th-navigator-item',
  templateKey: 'src/main/navigator-item',
})
export class NavigatorItem extends BaseThemedElement2 {
  constructor(
      @inject('x.dom.window') private readonly window_: Window,
      @inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
  }

  private async getDefaultItem_(item: Item, itemService: ItemService): Promise<Item | null> {
    if (!(item instanceof Folder)) {
      return item;
    }

    const promiseSet = item.getItems()
        .mapItem((itemId) => itemService.getItem(itemId));
    const childItems = await Promise.all([...promiseSet]);
    const defaultItem = childItems
        .find((item) => {
          if (!item) {
            return false;
          }

          const name = item.getName();
          const parts = name.split('.');
          if (parts.length <= 0) {
            return false;
          }

          return parts[0] === 'index';
        });

    if (defaultItem) {
      return defaultItem;
    } else {
      return childItems[0] || null;
    }
  }

  @onDom.event($.deleteButton.el, 'click')
  @onDom.event($.renameButton.el, 'click')
  @onDom.event($.renderButton.el, 'click')
  @onDom.event($.refreshButton.el, 'click')
  onActionButtonClick_(event: MouseEvent): void {
    event.stopPropagation();
  }

  @onDom.event($.deleteButton.el, 'gs-action')
  async onDeleteButtonAction_(): Promise<void> {
    const time = Graph.getTimestamp();
    const [itemId, parent, itemService] = await Graph.getAll(
        time,
        this,
        $.host.itemid.getId(),
        $parent,
        $itemService);

    if (!itemId) {
      return;
    }

    if (!(parent instanceof ThothFolder)) {
      return;
    }

    itemService.save(parent.setItems(parent.getItems().delete(itemId)));
  }

  @onDom.event($.host.el, 'click')
  async onHostClick_(): Promise<void> {
    const time = Graph.getTimestamp();
    const [item, path, isEditing]
        = await Graph.getAll(time, this, $item, $location.path, $isEditing);
    if (isEditing) {
      return;
    }

    if (!item) {
      return;
    }

    navigateToHash(`${path}/${item.getName()}`);
  }

  @onDom.event($.refreshButton.el, 'gs-action')
  async onRefreshButtonAction_(event: MouseEvent): Promise<void> {
    event.stopPropagation();

    const time = Graph.getTimestamp();
    const [item, driveService, itemService] = await Graph.getAll(
        time,
        this,
        $item,
        $driveService,
        $itemService);
    if (!(item instanceof DriveFile) && !(item instanceof DriveFolder)) {
      return;
    }

    const parentId = item.getParentId();
    if (!parentId) {
      throw Errors.assert('parentId').shouldExist().butWas(parentId);
    }

    const files = await driveService.recursiveGet(item.getDriveId(), parentId);
    files.mapItem((file) => itemService.save(file));
  }

  @onDom.event($.renameButton.el, 'gs-action')
  async onRenameButtonAction_(): Promise<void> {
    const time = Graph.getTimestamp();
    const [isEditing, item, itemService] = await Graph.getAll(
        time,
        this,
        $isEditing,
        $item,
        $itemService);
    const shadowRoot = Persona.getShadowRoot(this);
    if (!shadowRoot) {
      return;
    }

    if (!item) {
      return;
    }

    if (isEditing) {
      const newName = $.nameInput.value.getValue(shadowRoot);
      if (newName) {
        itemService.save(item.setName(newName));
      }
    } else {
      $.nameInput.value.setValue(item.getName(), shadowRoot, time);
    }

    return isEditingProvider(!isEditing, this);
  }

  @onDom.event($.renderButton.el, 'gs-action')
  async onRenderButtonAction_(event: MouseEvent): Promise<void> {
    event.stopPropagation();

    const time = Graph.getTimestamp();
    const [item, itemService, renderService] = await Graph.getAll(
        time,
        this,
        $item,
        $itemService,
        $renderService);
    if (item === null) {
      return;
    }

    await renderService.render(item.getId());

    const defaultItem = await this.getDefaultItem_(item, itemService);
    if (!defaultItem) {
      return;
    }

    const path = await itemService.getPath(defaultItem.getId());
    if (!path) {
      return;
    }

    this.window_.open(`${PREVIEW_PATH_ROOT}${path}`, PREVIEW_WINDOW_NAME);
  }

  @nodeOut($item)
  providesItem(
      @nodeIn($itemService) itemService: ItemService,
      @nodeIn($.host.itemid.getId()) itemId: string | null): Promise<Item | null> {
    if (!itemId) {
      return Promise.resolve(null);
    }
    return itemService.getItem(itemId);
  }

  @nodeOut($parent)
  providesParent(
      @nodeIn($item) item: Item | null,
      @nodeIn($itemService) itemService: ItemService): Promise<Item | null> {
    if (!item) {
      return Promise.resolve(null);
    }

    const parentId = item.getParentId();
    if (!parentId) {
      return Promise.resolve(null);
    }

    return itemService.getItem(parentId);
  }

  @render.class($.content.class.editing)
  renderContentClassEditing_(@nodeIn($isEditing) isEditing: boolean): boolean {
    return isEditing;
  }

  @render.attribute($.host.deleteable)
  renderDeleteable_(@nodeIn($parent) parent: Item | null): boolean {
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
        case FileType.METADATA:
          return 'settings';
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
