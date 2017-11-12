import { Errors } from 'external/gs_tools/src/error';
import { Graph, GraphTime } from 'external/gs_tools/src/graph';
import { ImmutableSet } from 'external/gs_tools/src/immutable';

import { $items, ItemService } from '../data';
import { EditableFolderImpl } from '../data/editable-folder-impl';
import { FileImpl } from '../data/file-impl';
import { FolderImpl } from '../data/folder-impl';
import { PreviewFile } from '../data/preview-file';
import { PreviewFolder } from '../data/preview-folder';
import { ShowdownService } from '../render/showdown-service';

export class RenderServiceClass {
  async getPreviewId(id: string, time: GraphTime): Promise<string> {
    // Get the top editable folder.
    const editableAncestorPath = await ItemService.findFirstEditableAncestorPath(id, time);
    if (!editableAncestorPath) {
      throw Errors.assert(`Editable ancestor of ${id}`).shouldExist().butNot();
    }

    const containerId = editableAncestorPath[0];
    return `${containerId}/$$${id.substr(containerId.length + 1)}`;
  }

  async render(id: string, time: GraphTime): Promise<string> {
    const previewId = await this.getPreviewId(id, time);

    // Check if the preview already exists.
    const itemsGraph = await Graph.get($items, time);
    const existingPreviewItem = await itemsGraph.get(previewId);
    if (existingPreviewItem) {
      return existingPreviewItem.getId();
    }

    // Preview doesn't exist, so create a new one.
    const item = await itemsGraph.get(id);
    if (!item) {
      throw Errors.assert(`Item for id ${id}`).shouldExist().butNot();
    }

    // Get the top editable folder.
    const editableAncestorPath = await ItemService.findFirstEditableAncestorPath(id, time);
    if (!editableAncestorPath) {
      throw Errors.assert(`Editable ancestor of [${id}]`).shouldExist().butNot();
    }
    const parentId = editableAncestorPath[0];
    const parentItem = await itemsGraph.get(parentId);
    if (!(parentItem instanceof EditableFolderImpl)) {
      throw Errors.assert(`Parent item [${parentId}]`)
          .shouldBe('an editable folder')
          .butWas(parentItem);
    }

    const previewName = ItemService.getNameFromId(previewId);
    let previewItem: PreviewFile | PreviewFolder;
    if (item instanceof FolderImpl) {
      const renderedFolderContents = await Promise.all([
        ...item.getItems().mapItem((itemId) => this.getPreviewId(itemId, time)),
      ]);
      previewItem = PreviewFolder.newInstance(
          previewId,
          previewName,
          parentId,
          ImmutableSet.of(renderedFolderContents),
          id);
    } else if (item instanceof FileImpl) {
      previewItem = PreviewFile.newInstance(
          previewId,
          previewName,
          parentId,
          ShowdownService.render(item.getContent()),
          id);
    } else {
      throw Errors.assert(`Item for ID [${id}]`).shouldBe('a File or Folder').butWas(item);
    }

    ItemService.save(
        time,
        previewItem,
        parentItem.setItems(parentItem.getItems().add(previewId)));
    return previewId;
  }
}

export const RenderService = new RenderServiceClass();
