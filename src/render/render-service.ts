import { InstanceofType } from 'external/gs_tools/src/check';
import { Errors } from 'external/gs_tools/src/error';
import { Graph, staticId } from 'external/gs_tools/src/graph';
import { ImmutableMap } from 'external/gs_tools/src/immutable';
import { Paths } from 'external/gs_tools/src/path';
import { assertUnreachable } from 'external/gs_tools/src/typescript';
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
  PreviewService,
  RenderConfig } from '../data';
import { HandlebarsService } from '../render/handlebars-service';
import { ShowdownService } from '../render/showdown-service';

type AssetItem = MarkdownFile;
const DEFAULT_TEMPLATE_KEY = 'src/render/render-default-template';

// Type of item that can be compiled. Map of output filename to context for handlebars.
type CompiledItem = ImmutableMap<string, {}>;

export class RenderService {
  constructor(
      private readonly itemService_: ItemService,
      private readonly metadataService_: MetadataService,
      private readonly previewService_: PreviewService,
      private readonly templates_: Templates) { }

  private compileItem_(item: AssetItem, renderConfig: RenderConfig): CompiledItem {
    if (item instanceof MarkdownFile) {
      const renderedMarkdown = ShowdownService.render(
          item.getContent(),
          renderConfig.getShowdownConfig());
      return ImmutableMap.of([
        [item.getName(), {$mainContent: renderedMarkdown}],
      ]);
    }

    throw assertUnreachable(item);
  }

  private async getTemplateContent_(): Promise<string> {
    // TODO: Use the specified template.

    const content = this.templates_.getTemplate(DEFAULT_TEMPLATE_KEY);
    if (!content) {
      throw Errors.assert('default template').shouldExist().butNot();
    }
    return content;
  }

  async render(id: string): Promise<any> {
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
    const [item, itemPath] = await Promise.all([
      this.itemService_.getItem(id),
      this.itemService_.getPath(id),
    ]);
    if (!item || !itemPath) {
      throw Errors.assert(`Item for id ${id}`).shouldExist().butNot();
    }

    if (item instanceof Folder) {
      return Promise
          .all([
            ...item.getItems().mapItem((itemId) => this.render(itemId)),
          ]);
    }

    if (!(item instanceof MarkdownFile)) {
      return;
    }

    const renderConfig = await this.metadataService_.getConfigForItem(item.getId());
    const template = await this.getTemplateContent_();
    const compiledPromises = this
        .compileItem_(item, renderConfig)
        .mapItem(([filename, context]) => {
          const renderedContent = this.renderItem_(context, template, renderConfig);
          const renderedFileName = Paths.normalize(
              Paths.join(Paths.getDirPath(itemPath), Paths.relativePath(filename)));
          const previewFile = PreviewFile.newInstance(renderedFileName.toString(), renderedContent);
          return this.previewService_.save(previewFile);
        });
    return Promise.all(compiledPromises);
  }

  private renderItem_(context: {}, template: string, renderConfig: RenderConfig): string {
    return HandlebarsService.render(context, template, renderConfig.getVariables());
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

