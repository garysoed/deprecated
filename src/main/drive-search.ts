import { BooleanType, ElementWithTagType, EnumType, HasPropertiesType, InstanceofType, IterableOfType, NullableType, StringType } from 'external/gs_tools/src/check';
import { Errors } from 'external/gs_tools/src/error';
import { Graph, instanceId, nodeIn } from 'external/gs_tools/src/graph';
import { ImmutableList } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import { BooleanParser, EnumParser, StringParser } from 'external/gs_tools/src/parse';
import { attributeSelector, childrenSelector, component, dispatcherSelector, elementSelector, onDom, Persona, render, resolveSelectors, shadowHostSelector, slotSelector } from 'external/gs_tools/src/persona';

import { BaseThemedElement2 } from 'external/gs_ui/src/common';
import { ThemeService } from 'external/gs_ui/src/theming';

import { $itemService, $selectedItem } from '../data';
import { ApiFileSummary, ApiFileType, DriveSource, DriveStorage } from '../datasource';
import { SearchItem } from '../main/search-item';

type ItemSummaryType = {id: string, name: string, type: ApiFileType};
const DriveFileSummaryType = HasPropertiesType<ItemSummaryType>({
  id: StringType,
  name: StringType,
  type: EnumType(ApiFileType),
});

type DriveFileItemData = {
  selected: boolean | null,
  summary: ItemSummaryType,
};

const DriveFileItemDataType = HasPropertiesType<DriveFileItemData>({
  selected: NullableType<boolean>(BooleanType),
  summary: DriveFileSummaryType,
});

export function driveItemsGetter(element: HTMLElement): DriveFileItemData {
  const item = element.children[0];
  const id = item.getAttribute('itemid');
  const name = item.getAttribute('text');
  const type = EnumParser<ApiFileType>(ApiFileType).parse(item.getAttribute('type'));
  if (!id) {
    throw Errors.assert('itemid').should('exist').butWas(id);
  }

  if (!name) {
    throw Errors.assert('text').should('exist').butWas(name);
  }

  if (type === null) {
    throw Errors.assert('type').should('exist').butWas(type);
  }

  const selected = BooleanParser.parse(item.getAttribute('selected'));
  return {selected, summary: {id, name, type}};
}

export function driveItemsFactory(document: Document): HTMLElement {
  const item = document.createElement('th-search-item');
  const container = document.createElement('div');
  container.appendChild(item);
  container.classList.add('itemContainer');
  return container;
}

export function driveItemsSetter({summary}: DriveFileItemData, element: HTMLElement): void {
  const item = element.children[0];
  item.setAttribute('text', summary.name);
  item.setAttribute('itemId', summary.id);
  item.setAttribute('type', EnumParser<ApiFileType>(ApiFileType).stringify(summary.type));
}

export const $ = resolveSelectors({
  host: {
    dispatcher: dispatcherSelector(elementSelector('host.el')),
    el: shadowHostSelector,
  },
  input: {
    el: elementSelector('#input', ElementWithTagType('gs-text-input')),
    value: attributeSelector(
        elementSelector('input.el'),
        'value',
        StringParser,
        StringType,
        ''),
  },
  okButton: {
    el: elementSelector('#okButton', ElementWithTagType('gs-basic-button')),
  },
  results: {
    children: childrenSelector(
        slotSelector(elementSelector('results.el'), 'driveItems'),
        driveItemsFactory,
        driveItemsGetter,
        driveItemsSetter,
        DriveFileItemDataType,
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
    const folders = (await DriveStorage.search(query || ''))
        .map((summary: ApiFileSummary<DriveSource>) => {
          return {
            id: summary.source.getId(),
            name: summary.name,
            type: summary.type,
          };
        });
    return driveItemsProvider(folders, this);
  }

  @onDom.event($.okButton.el, 'gs-action')
  async onOkButtonAction_(): Promise<void> {
    const items = Persona.getValue($.results.children, this);
    if (!items) {
      return;
    }

    const time = Graph.getTimestamp();
    const [selectedItem, itemService] = await Graph.getAll(
        time,
        this,
        $selectedItem,
        $itemService);

    const selectedId = selectedItem.getId();
    const addedItemSources = items
        .filter((item) => !!item.selected)
        .map((item) => DriveSource.newInstance(item.summary.id));
    for (const addedItemSource of addedItemSources) {
      await itemService.addItems(addedItemSource, selectedId);
    }

    const dispatcher = Persona.getValue($.host.dispatcher, this);
    if (!dispatcher) {
      throw Errors
          .assert(`Value for ${$.host.dispatcher.toString()}`)
          .shouldExist()
          .butWas(dispatcher);
    }

    dispatcher('th-item-added', {});
  }

  @render.children($.results.children)
  renderDriveItems_(@nodeIn($driveItems) items: Iterable<ItemSummaryType>):
      ImmutableList<DriveFileItemData> {
    return ImmutableList.of([...items])
        .map((item) => {
          return {
            selected: null,
            summary: item,
          };
        });
  }
}
