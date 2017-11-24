import { InstanceofType } from 'external/gs_tools/src/check';
import { $time, Graph, GraphTime, staticId } from 'external/gs_tools/src/graph';
import { $location, navigateToHash } from 'external/gs_tools/src/ui';

import { Item } from '../data/item';
import { $items } from '../data/item-graph';
import { ItemService } from '../data/item-service';

export const ROOT_PATH = '/(root)';

export async function providesSelectedItem(location: string, time: GraphTime): Promise<Item> {
  if (!location) {
    navigateToHash(ROOT_PATH);
    return ItemService.getRootFolder(time);
  }

  const item = await ItemService.getItemByPath(time, location);

  if (item instanceof Item) {
    return item;
  } else if (location !== ROOT_PATH) {
    navigateToHash(ROOT_PATH);
    return ItemService.getRootFolder(time);
  } else {
    return ItemService.getRootFolder(time);
  }
}

export const $selectedItem = staticId('selectedItem', InstanceofType(Item));
Graph.registerProvider(
    $selectedItem,
    providesSelectedItem,
    $location.path,
    $time);
Graph.onReady(null, $items, () => {
  Graph.refresh($selectedItem);
});
