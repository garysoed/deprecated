import {
  ElementWithTagType,
  EnumType,
  HasPropertiesType,
  InstanceofType,
  IterableOfType,
  StringType} from 'external/gs_tools/src/check';
  import { AssertionError } from 'external/gs_tools/src/error';
import { Graph, instanceId, nodeIn } from 'external/gs_tools/src/graph';
import { ImmutableList } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import { EnumParser, StringParser } from 'external/gs_tools/src/parse';
import {
  attributeSelector,
  childrenSelector,
  component,
  elementSelector,
  onDom,
  Persona,
  render,
  resolveSelectors,
  slotSelector} from 'external/gs_tools/src/persona';

import { BaseThemedElement2 } from 'external/gs_ui/src/common';
import { ThemeService } from 'external/gs_ui/src/theming';

import { DriveFileSummary, DriveType } from '../import/drive';
import { DriveStorage } from '../import/drive-storage';
import { SearchItem } from '../main/search-item';

const DriveFileSummaryType = HasPropertiesType<DriveFileSummary>({
  id: StringType,
  name: StringType,
  type: EnumType(DriveType),
});

export function driveItemsGetter(element: HTMLElement): DriveFileSummary {
  const item = element.children[0];
  const id = item.getAttribute('id');
  const name = item.getAttribute('text');
  const type = EnumParser<DriveType>(DriveType).parse(item.getAttribute('type'));
  if (!id) {
    throw AssertionError.condition('id', 'exist', id);
  }

  if (!name) {
    throw AssertionError.condition('text', 'exist', name);
  }

  if (type === null) {
    throw AssertionError.condition('type', 'exist', type);
  }
  return {id, name, type};
}

export function driveItemsFactory(document: Document): HTMLElement {
  const item = document.createElement('th-search-item');
  const container = document.createElement('div');
  container.appendChild(item);
  container.classList.add('itemContainer');
  return container;
}

export function driveItemsSetter(folder: DriveFileSummary, element: HTMLElement): void {
  const item = element.children[0];
  item.setAttribute('text', folder.name);
  item.setAttribute('itemId', folder.id);
  item.setAttribute('type', EnumParser<DriveType>(DriveType).stringify(folder.type));
}

export const $ = resolveSelectors({
  input: {
    el: elementSelector('#input', ElementWithTagType('gs-text-input')),
    value: attributeSelector(
        elementSelector('input.el'),
        'value',
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
        DriveFileSummaryType,
        InstanceofType(HTMLElement)),
    el: elementSelector('#results', ElementWithTagType('section')),
  },
});

export const $driveItems = instanceId('driveItems', IterableOfType(DriveFileSummaryType));
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
    const query = Persona.getValue($.input.value, this);
    const folders = await DriveStorage.search(query || '');
    return driveItemsProvider(folders, this);
  }

  @render.children($.results.children)
  renderDriveItems_(@nodeIn($driveItems) items: Iterable<string>): ImmutableList<string> {
    return ImmutableList.of([...items]);
  }
}
