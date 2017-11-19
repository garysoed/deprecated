import { Errors } from 'external/gs_tools/src/error';
import { Graph, GraphTime } from 'external/gs_tools/src/graph';

import {
  $items,
  File,
  FileType,
  Folder,
  ItemService,
  PreviewFile} from '../data';
import { HandlebarsService } from '../render/handlebars-service';
import { ShowdownService } from '../render/showdown-service';

export class RenderServiceClass {
  async render(id: string, time: GraphTime): Promise<void> {
    // Check if the preview already exists.
    const existingPreviewItem = await ItemService.getPreview(time, id);
    if (existingPreviewItem) {
      return;
    }

    // Preview doesn't exist, so create a new one.
    const itemsGraph = await Graph.get($items, time);
    const item = await itemsGraph.get(id);
    if (!item) {
      throw Errors.assert(`Item for id ${id}`).shouldExist().butNot();
    }

    if (item instanceof Folder) {
      await Promise.all([
        ...item.getItems().mapItem((itemId) => this.render(itemId, time)),
      ]);
    } else if ((item instanceof File) && item.getType() === FileType.ASSET) {
      await ItemService.savePreview(
          time,
          PreviewFile.newInstance(
              id,
              HandlebarsService.render(ShowdownService.render(item.getContent()))));
    }
  }
}

export const RenderService = new RenderServiceClass();
