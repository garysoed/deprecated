import { InstanceofType } from 'external/gs_tools/src/check';
import { DataGraph } from 'external/gs_tools/src/datamodel';
import { Graph, staticId } from 'external/gs_tools/src/graph';
import { ImmutableSet } from 'external/gs_tools/src/immutable';
import { $location, navigateToHash } from 'external/gs_tools/src/ui';

import { Item } from '../data/item';
import { $items } from '../data/item-graph';
import { ThothFolder } from '../data/thoth-folder';

export const ROOT_ID = '/(root)';

export const ROOT_ITEM = ThothFolder.newInstance(
    ROOT_ID,
    '(root)',
    null,
    ImmutableSet.of([]));

export async function providesSelectedItem(
    location: string,
    itemGraph: DataGraph<Item>): Promise<Item> {
  if (!location) {
    navigateToHash(ROOT_ID);
    return ROOT_ITEM;
  }

  const item = await itemGraph.get(location);

  if (item instanceof Item) {
    return item;
  } else if (location !== ROOT_ID) {
    navigateToHash(ROOT_ID);
    return ROOT_ITEM;
  } else {
    return ROOT_ITEM;
  }
}

export const $selectedItem = staticId('selectedItem', InstanceofType(Item));
Graph.registerProvider(
    $selectedItem,
    providesSelectedItem,
    $location.path,
    $items);
Graph.onReady(null, $items, () => {
  Graph.refresh($selectedItem);
});
