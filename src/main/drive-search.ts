import {
  ElementWithTagType,
  HasPropertiesType,
  InstanceofType,
  IterableOfType,
  StringType } from 'external/gs_tools/src/check';
  import { AssertionError } from 'external/gs_tools/src/error';
import { Graph, instanceId, nodeIn } from 'external/gs_tools/src/graph';
import { ImmutableList } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import { StringParser } from 'external/gs_tools/src/parse';
import {
  attributeSelector,
  childrenSelector,
  component,
  elementSelector,
  onDom,
  render,
  resolveSelectors,
  slotSelector } from 'external/gs_tools/src/persona';

import { BaseThemedElement2 } from 'external/gs_ui/src/common';
import { ThemeService } from 'external/gs_ui/src/theming';

import { DriveFolder, DriveStorage } from '../import/drive-storage';
import { SearchItem } from '../main/search-item';

const DriveFolderType = HasPropertiesType<DriveFolder>({
  id: StringType,
  name: StringType,
});

export function driveItemsGetter(element: HTMLElement): DriveFolder {
  const item = element.children[0];
  const id = item.getAttribute('id');
  const name = item.getAttribute('text');
  if (!id) {
    throw AssertionError.condition('id', 'should exist', id);
  }

  if (!name) {
    throw AssertionError.condition('text', 'should exist', name);
  }
  return {id, name};
}

export function driveItemsFactory(document: Document): HTMLElement {
  const item = document.createElement('th-search-item');
  const container = document.createElement('div');
  container.appendChild(item);
  container.classList.add('itemContainer');
  return container;
}

export function driveItemsSetter(folder: DriveFolder, element: HTMLElement): void {
  const item = element.children[0];
  item.setAttribute('text', folder.name);
  item.setAttribute('itemId', folder.id);
}

export const $ = resolveSelectors({
  input: {
    el: elementSelector('#input', ElementWithTagType('gs-text-input')),
    valueOut: attributeSelector(
        elementSelector('input.el'),
        'value-out',
        StringParser,
        StringType,
        ''),
  },
  results: {
    children: childrenSelector(
        slotSelector(elementSelector('results.el'), 'driveItems'),
        driveItemsFactory,
        driveItemsGetter,
        driveItemsSetter,
        DriveFolderType,
        InstanceofType(HTMLElement)),
    el: elementSelector('#results', ElementWithTagType('section')),
  },
});

export const $driveItems = instanceId('driveItems', IterableOfType(DriveFolderType));
const driveItemsProvider = Graph.createProvider($driveItems, []);

@component({
  dependencies: [SearchItem],
  tag: 'th-drive-search',
  templateKey: 'src/main/drive-search',
})
export class DriveSearch extends BaseThemedElement2 {
  constructor(@inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
  }

  @onDom.event($.input.el, 'change')
  async onInputChange_(): Promise<void> {
    // TODO: Take in search query
    const folders = await DriveStorage.list();
    return driveItemsProvider(folders, this);
  }

  @render.children($.results.children)
  renderDriveItems_(@nodeIn($driveItems) items: Iterable<string>): ImmutableList<string> {
    return ImmutableList.of([...items]);
  }
}
