import { InstanceofType } from 'external/gs_tools/src/check';
import { DataGraph } from 'external/gs_tools/src/datamodel';
import { Graph, staticId } from 'external/gs_tools/src/graph';
import { ImmutableSet } from 'external/gs_tools/src/immutable';
import { $location } from 'external/gs_tools/src/ui';

import { FolderImpl } from '../data/folder-impl';
import { $items } from '../data/item-graph';
import { ItemImpl } from '../data/item-impl';
import { ThothFolder } from '../data/thoth-folder';

export const ROOT_ID = '(root)';

export const ROOT_ITEM = ThothFolder.newInstance(
    ROOT_ID,
    '(root)',
    null,
    ImmutableSet.of([]));

export async function providesSelectedFolder(
    location: string,
    itemGraph: DataGraph<ItemImpl>): Promise<FolderImpl> {
  const id = location.substr(1) || ROOT_ID;
  const [item, rootItem] = await Promise.all([itemGraph.get(id), itemGraph.get(ROOT_ID)]);

  if (item instanceof FolderImpl) {
    return item;
  } else if (rootItem instanceof FolderImpl) {
    return rootItem;
  } else {
    return ROOT_ITEM;
  }
}

export const $selectedFolder = staticId('selectedFolder', InstanceofType(FolderImpl));
Graph.registerProvider(
    $selectedFolder,
    providesSelectedFolder,
    $location.path,
    $items);
Graph.onReady(null, $items, () => {
  Graph.refresh($selectedFolder);
});
