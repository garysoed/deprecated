import { InstanceofType } from 'external/gs_tools/src/check';
import { Errors } from 'external/gs_tools/src/error';
import { Graph, staticId } from 'external/gs_tools/src/graph';

import {
  $previewService,
  File,
  FileType,
  Folder,
  ItemService,
  PreviewFile,
  PreviewService} from '../data';
import { $itemService } from '../data/item-service';
import { HandlebarsService } from '../render/handlebars-service';
import { ShowdownService } from '../render/showdown-service';

export class RenderService {
  constructor(
      private readonly itemService_: ItemService,
      private readonly previewService_: PreviewService) { }

  async render(id: string): Promise<void> {
    const path = await this.itemService_.getPath(id);
    if (!path) {
      throw Errors.assert(`Path for item [${id}]`).shouldExist().butWas(path);
    }

    // Check if the preview already exists.
    const existingPreviewItem = await this.previewService_.get(path);
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
      await this.previewService_.save(
          PreviewFile.newInstance(
              path,
              HandlebarsService.render(ShowdownService.render(item.getContent()))));
    }
  }
}

export const $renderService = staticId('renderService', InstanceofType(RenderService));
Graph.registerProvider(
    $renderService,
    (itemService, previewService) => {
      return new RenderService(itemService, previewService);
    },
    $itemService,
    $previewService);

