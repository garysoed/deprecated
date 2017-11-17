import { InstanceofType } from 'external/gs_tools/src/check';
import { DataGraph } from 'external/gs_tools/src/datamodel';
import { Graph, staticId } from 'external/gs_tools/src/graph';
import { ImmutableSet } from 'external/gs_tools/src/immutable';
import { $location, navigateToHash } from 'external/gs_tools/src/ui';

import { $items } from '../data/item-graph';
import { ItemImpl } from '../data/item-impl';
import { ThothFolder } from '../data/thoth-folder';

export const ROOT_ID = '/(root)';

export const ROOT_ITEM = ThothFolder.newInstance(
    ROOT_ID,
    '(root)',
    null,
    ImmutableSet.of([]));

export async function providesSelectedFolder(
    location: string,
    itemGraph: DataGraph<ItemImpl>): Promise<ItemImpl> {
  if (!location) {
    navigateToHash(ROOT_ID);
    return ROOT_ITEM;
  }

  const item = await itemGraph.get(location);

  if (item instanceof ItemImpl) {
    return item;
  } else if (location !== ROOT_ID) {
    navigateToHash(ROOT_ID);
    return ROOT_ITEM;
  } else {
    return ROOT_ITEM;
  }
}

export const $selectedItem = staticId('selectedFolder', InstanceofType(ItemImpl));
Graph.registerProvider(
    $selectedItem,
    providesSelectedFolder,
    $location.path,
    $items);
Graph.onReady(null, $items, () => {
  Graph.refresh($selectedItem);
});
