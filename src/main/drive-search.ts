import {
  BooleanType,
  ElementWithTagType,
  EnumType,
  HasPropertiesType,
  InstanceofType,
  IterableOfType,
  NullableType,
  StringType} from 'external/gs_tools/src/check';
import { DataGraph } from 'external/gs_tools/src/datamodel';
import { Errors } from 'external/gs_tools/src/error';
import { Graph, instanceId, nodeIn } from 'external/gs_tools/src/graph';
import { ImmutableList, ImmutableSet } from 'external/gs_tools/src/immutable';
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

import { DriveFile } from '../data/drive-file';
import { DriveFolder } from '../data/drive-folder';
import { EditableFolderImpl } from '../data/editable-folder-impl';
import { $items } from '../data/item-graph';
import { ItemImpl } from '../data/item-impl';
import { convertToItemType } from '../data/item-type';
import { ApiDriveFile, ApiDriveFileSummary, ApiDriveType } from '../import/drive';
import { DriveStorage } from '../import/drive-storage';
import { SearchItem } from '../main/search-item';
import { $selectedFolder } from '../main/selected-folder-graph';


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

  private async createAddedItem_(
      addedItem: ApiDriveFile,
      parentFolderId: string,
      itemsDataGraph: DataGraph<ItemImpl>): Promise<any> {
    const apiType = addedItem.summary.type;
    if (apiType !== ApiDriveType.FOLDER) {
      const newFile = DriveFile.newInstance(
          addedItem.summary.id,
          addedItem.summary.name,
          parentFolderId,
          convertToItemType(apiType),
          addedItem.content || '');
      return itemsDataGraph.set(newFile.getId(), newFile);
    }

    const newFolder = DriveFolder.newInstance(
        addedItem.summary.id,
        addedItem.summary.name,
        parentFolderId,
        ImmutableSet.of(addedItem.files).mapItem((file) => file.summary.id));

    const contentPromises = addedItem.files.map((file) => {
      return this.createAddedItem_(file, addedItem.summary.id, itemsDataGraph);
    });
    return Promise.all([
      itemsDataGraph.set(newFolder.getId(), newFolder),
      ...contentPromises,
    ]);
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

    const addedItems = items.filter((item) => !!item.selected);
    const addedItemPromises = addedItems.map((item) => DriveStorage.read(item.summary.id));

    const time = Graph.getTimestamp();
    const [selectedFolder, itemsDataGraph, addedItemData] = await Promise.all([
      Graph.get($selectedFolder, time),
      Graph.get($items, time),
      Promise.all(addedItemPromises),
    ]);

    const selectedId = selectedFolder.getId();

    if (!(selectedFolder instanceof EditableFolderImpl)) {
      throw Errors.assert('selectedFolder').should('be editable').butWas(selectedFolder);
    }

    await Promise.all(addedItemData.map((data) => {
      return this.createAddedItem_(data, selectedId, itemsDataGraph);
    }));

    // Now add the folders to the selected folder.
    await itemsDataGraph.set(
        selectedId,
        selectedFolder.setItems(
            selectedFolder
                .getItems()
                .addAll(addedItems.map((addedItem) => addedItem.summary.id))));

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
