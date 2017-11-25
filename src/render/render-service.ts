import { InstanceofType } from 'external/gs_tools/src/check';
import { Errors } from 'external/gs_tools/src/error';
import { Graph, staticId } from 'external/gs_tools/src/graph';

import {
  File,
  FileType,
  Folder,
  ItemService,
  PreviewFile} from '../data';
import { $itemService } from '../data/item-service';
import { HandlebarsService } from '../render/handlebars-service';
import { ShowdownService } from '../render/showdown-service';

export class RenderService {
  constructor(private readonly itemService_: ItemService) { }

  async render(id: string): Promise<void> {
    // Check if the preview already exists.
    const existingPreviewItem = await this.itemService_.getPreview(id);
    if (existingPreviewItem) {
      return;
    }

    // Preview doesn't exist, so create a new one.
    const item = await this.itemService_.getItem(id);
    if (!item) {
      throw Errors.assert(`Item for id ${id}`).shouldExist().butNot();
    }

    if (item instanceof Folder) {
      await Promise.all([
        ...item.getItems().mapItem((itemId) => this.render(itemId)),
      ]);
    } else if ((item instanceof File) && item.getType() === FileType.ASSET) {
      await this.itemService_.savePreview(
          PreviewFile.newInstance(
              id,
              HandlebarsService.render(ShowdownService.render(item.getContent()))));
    }
  }
}

export const $renderService = staticId('renderService', InstanceofType(RenderService));
Graph.registerProvider(
    $renderService,
    (itemService) => {
      return new RenderService(itemService);
    },
    $itemService);

