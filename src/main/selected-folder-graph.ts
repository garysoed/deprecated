import { InstanceofType } from 'external/gs_tools/src/check';
import { DataGraph } from 'external/gs_tools/src/datamodel';
import { Graph, staticId } from 'external/gs_tools/src/graph';
import { ImmutableSet } from 'external/gs_tools/src/immutable';
import { $location } from 'external/gs_tools/src/ui';

import { EditableFolderImpl } from '../data/editable-folder-impl';
import { FolderImpl } from '../data/folder-impl';
import { $items } from '../data/item-graph';
import { ItemImpl } from '../data/item-impl';

export const ROOT_ITEM = new EditableFolderImpl('/', '(root)', '/', ImmutableSet.of([]), null);

export async function providesSelectedFolder(
    location: string,
    itemGraph: DataGraph<ItemImpl>): Promise<FolderImpl> {
  const item = await itemGraph.get(location);
  return (item instanceof FolderImpl) ? item : ROOT_ITEM;
}

export const $selectedFolder = staticId('selectedFolder', InstanceofType(FolderImpl));
export const selectedFolderProvider = Graph.registerProvider(
    $selectedFolder,
    providesSelectedFolder,
    $location.path,
    $items);
