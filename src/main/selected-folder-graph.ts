import { InstanceofType } from 'external/gs_tools/src/check';
import { DataGraph } from 'external/gs_tools/src/datamodel';
import { Graph, staticId } from 'external/gs_tools/src/graph';
import { ImmutableSet } from 'external/gs_tools/src/immutable';
import { $location } from 'external/gs_tools/src/ui';

import { EditableFolder } from '../data/editable-folder';
import { Folder } from '../data/folder';
import { Item } from '../data/item';
import { $items } from '../data/item-graph';

export const ROOT_ITEM = new EditableFolder('/', '(root)', '/', ImmutableSet.of([]), null);

export async function providesSelectedFolder(
    location: string,
    itemGraph: DataGraph<Item>): Promise<Folder> {
  const item = await itemGraph.get(location);
  return (item instanceof Folder) ? item : ROOT_ITEM;
}

export const $selectedFolder = staticId('selectedFolder', InstanceofType(Folder));
export const selectedFolderProvider = Graph.registerProvider(
    $selectedFolder,
    providesSelectedFolder,
    $location.path,
    $items);
