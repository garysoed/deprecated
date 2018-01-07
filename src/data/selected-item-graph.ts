import { InstanceofType } from 'external/gs_tools/src/check';
import { Graph, staticId } from 'external/gs_tools/src/graph';
import { PathParser } from 'external/gs_tools/src/path';
import { $location, navigateToHash } from 'external/gs_tools/src/ui';

import { Item } from '../data/item';
import { $items } from '../data/item-graph';
import { $itemService, ItemService } from '../data/item-service';

export const ROOT_PATH = '/(root)';

export async function providesSelectedItem(
    location: string,
    itemService: ItemService): Promise<Item> {
  if (!location) {
    navigateToHash(ROOT_PATH);
    return itemService.getRootFolder();
  }

  const path = PathParser.parse(location);
  if (!path) {
    navigateToHash(ROOT_PATH);
    return itemService.getRootFolder();
  }

  const item = await itemService.getItemByPath(path);

  if (item instanceof Item) {
    return item;
  } else if (location !== ROOT_PATH) {
    navigateToHash(ROOT_PATH);
    return itemService.getRootFolder();
  } else {
    return itemService.getRootFolder();
  }
}

export const $selectedItem = staticId('selectedItem', InstanceofType(Item));
Graph.registerProvider(
    $selectedItem,
    providesSelectedItem,
    $location.path,
    $itemService);
Graph.onReady(null, $items, () => {
  Graph.refresh($selectedItem);
});
