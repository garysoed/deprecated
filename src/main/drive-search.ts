import {
  BooleanType,
  ElementWithTagType,
  EnumType,
  HasPropertiesType,
  InstanceofType,
  IterableOfType,
  NullableType,
  StringType} from 'external/gs_tools/src/check';
import { Errors } from 'external/gs_tools/src/error';
import { Graph, instanceId, nodeIn } from 'external/gs_tools/src/graph';
import { ImmutableList, ImmutableSet, Iterables } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import { BooleanParser, EnumParser, StringParser } from 'external/gs_tools/src/parse';
import {
  attributeSelector,
  childrenSelector,
  component,
  dispatcherSelector,
  elementSelector,
  onDom,
  Persona,
  render,
  resolveSelectors,
  shadowHostSelector,
  slotSelector} from 'external/gs_tools/src/persona';

import { BaseThemedElement2 } from 'external/gs_ui/src/common';
import { ThemeService } from 'external/gs_ui/src/theming';

import {
  $selectedItem,
  DriveFile,
  DriveFolder,
  DriveService,
  ItemService,
  ThothFolder } from '../data';
import { ApiDriveFileSummary, ApiDriveType, DriveStorage } from '../import';
import { SearchItem } from '../main/search-item';

const DriveFileSummaryType = HasPropertiesType<ApiDriveFileSummary>({
  id: StringType,
  name: StringType,
  type: EnumType(ApiDriveType),
});

type DriveFileItemData = {
  selected: boolean | null,
  summary: ApiDriveFileSummary,
};

const DriveFileItemDataType = HasPropertiesType<DriveFileItemData>({
  selected: NullableType<boolean>(BooleanType),
  summary: DriveFileSummaryType,
});

export function driveItemsGetter(element: HTMLElement): DriveFileItemData {
  const item = element.children[0];
  const id = item.getAttribute('itemid');
  const name = item.getAttribute('text');
  const type = EnumParser<ApiDriveType>(ApiDriveType).parse(item.getAttribute('type'));
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
  item.setAttribute('type', EnumParser<ApiDriveType>(ApiDriveType).stringify(summary.type));
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
    const folders = await DriveStorage.search(query || '');
    return driveItemsProvider(folders, this);
  }

  @onDom.event($.okButton.el, 'gs-action')
  async onOkButtonAction_(): Promise<void> {
    const items = Persona.getValue($.results.children, this);
    if (!items) {
      return;
    }

    const time = Graph.getTimestamp();
    const [selectedItem] = await Promise.all([
      Graph.get($selectedItem, time),
    ]);

    if (!(selectedItem instanceof ThothFolder)) {
      throw Errors.assert('selectedFolder').should('be editable').butWas(selectedItem);
    }

    const selectedId = selectedItem.getId();
    const addedItems = items.filter((item) => !!item.selected);
    const addedDriveItemPromises = addedItems
        .map((item) => DriveService.recursiveGet(item.summary.id, selectedId));
    const addedDriveItems = await Promise.all(addedDriveItemPromises);

    // Stores all the drive items.
    const itemsToAddToSelectedFolder: (DriveFolder | DriveFile)[] = [];
    for (const addedItem of Iterables.flatten<DriveFile | DriveFolder>(addedDriveItems)) {
      ItemService.save(time, addedItem);

      if (addedItem.getParentId() === selectedId) {
        itemsToAddToSelectedFolder.push(addedItem);
      }
    }

    // Now add the folders to the selected folder.
    ItemService.save(
        time,
        selectedItem.setItems(
            selectedItem
                .getItems()
                .addAll(ImmutableSet.of(itemsToAddToSelectedFolder.map((item) => item.getId())))));

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
  renderDriveItems_(@nodeIn($driveItems) items: Iterable<ApiDriveFileSummary>):
      ImmutableList<DriveFileItemData> {
    return ImmutableList.of([...items])
        .map((item) => {
          return {selected: null, summary: item};
        });
  }
}
