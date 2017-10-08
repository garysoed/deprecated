import {
  ElementWithTagType,
  InstanceofType,
  IterableOfType,
  StringType } from 'external/gs_tools/src/check';
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

export function driveItemsGetter(element: HTMLDivElement): string {
  return element.innerText;
}

export function driveItemsFactory(document: Document): HTMLDivElement {
  return document.createElement('div');
}

export function driveItemsSetter(value: string, element: HTMLDivElement): void {
  element.innerText = value;
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
        StringType,
        InstanceofType(HTMLDivElement)),
    el: elementSelector('#results', ElementWithTagType('section')),
  },
});

export const $driveItems = instanceId('driveItems', IterableOfType(StringType));
const driveItemsProvider = Graph.createProvider($driveItems, ['']);

@component({
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
    return driveItemsProvider(folders.mapItem((folder: DriveFolder) => folder.name), this);
  }

  @render.children($.results.children)
  renderDriveItems_(@nodeIn($driveItems) items: Iterable<string>): ImmutableList<string> {
    return ImmutableList.of([...items]);
  }
}
