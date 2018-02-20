import { InstanceofType } from 'external/gs_tools/src/check';
import { Errors } from 'external/gs_tools/src/error';
import { Graph, staticId } from 'external/gs_tools/src/graph';
import { Templates } from 'external/gs_tools/src/webc';

import {
  $itemService,
  $metadataService,
  $previewService,
  Folder,
  ItemService,
  MarkdownFile,
  MetadataService,
  PreviewFile,
  PreviewService } from '../data';
import { HandlebarsService } from '../render/handlebars-service';
import { ShowdownService } from '../render/showdown-service';

const DEFAULT_TEMPLATE_KEY = 'src/render/render-default-template';

export class RenderService {
  constructor(
      private readonly itemService_: ItemService,
      private readonly metadataService_: MetadataService,
      private readonly previewService_: PreviewService,
      private readonly templates_: Templates) { }

  async getTemplateContent_(): Promise<string> {
    // TODO: Use the specified template.
    const content = this.templates_.getTemplate(DEFAULT_TEMPLATE_KEY);
    if (!content) {
      throw Errors.assert('default template').shouldExist().butNot();
    }
    return content;
  }

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
    } else if (item instanceof MarkdownFile) {
      const metadata = await this.metadataService_.getMetadataForItem(item.getId());

      const renderedItem = HandlebarsService.render(
          ShowdownService.render(item.getContent(), metadata.getShowdownConfigForPath(path)),
          await this.getTemplateContent_(),
          metadata.getGlobals());
      await this.previewService_.save(
          PreviewFile.newInstance(path.toString(), renderedItem));
    }
  }
}

export const $renderService = staticId('renderService', InstanceofType(RenderService));
Graph.registerProvider(
    $renderService,
    (itemService, metadataService, previewService) => {
      return new RenderService(
          itemService,
          metadataService,
          previewService,
          Templates.newInstance());
    },
    $itemService,
    $metadataService,
    $previewService);

