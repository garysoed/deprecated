import {
  HasPropertiesType,
  InstanceofType,
  ObjectType,
  StringType,
  UndefinedType,
  UnionType} from 'external/gs_tools/src/check';
import { Errors } from 'external/gs_tools/src/error';
import { Graph, staticId } from 'external/gs_tools/src/graph';
import { Path, Paths } from 'external/gs_tools/src/path';

import { File } from '../data/file';
import { FileType } from '../data/file-type';
import { Folder } from '../data/folder';
import { $itemService, ItemService } from '../data/item-service';
import { Metadata } from '../data/metadata';

export const DEFAULT_METADATA = new Metadata();

type MetadataJsonType = {
  globals?: {[key: string]: string},
  templates?: {[key: string]: string},
};
const METADATA_JSON_TYPE = HasPropertiesType<MetadataJsonType>({
  'globals': UnionType.builder<undefined | {[key: string]: string}>()
      .addType(UndefinedType)
      .addType(ObjectType.stringKeyed<string>(StringType))
      .build(),
  'templates': UnionType.builder<undefined | {[key: string]: string}>()
      .addType(UndefinedType)
      .addType(ObjectType.stringKeyed<string>(StringType))
      .build(),
});

export class MetadataService {
  constructor(private readonly itemService_: ItemService) { }

  private createMetadata_(unparsedContent: string, path: string): Metadata {
    const parsedContent = jsyaml.load(unparsedContent);
    if (!METADATA_JSON_TYPE.check(parsedContent)) {
      throw Errors.assert(`content of metadata [${path}]`).shouldBeA(METADATA_JSON_TYPE)
          .butWas(parsedContent);
    }

    const templates = parsedContent.templates;
    const defaultTemplateString = templates ?
        templates['$default'] || null :
        null;
    const defaultTemplate = StringType.check(defaultTemplateString) ?
        Paths.absolutePath(defaultTemplateString) :
        null;
    return new Metadata(defaultTemplate, parsedContent.globals);
  }

  async getMetadataForItem(itemId: string): Promise<Metadata> {
    const path = await this.itemService_.getPath(itemId);
    if (!path) {
      return DEFAULT_METADATA;
    }

    const dirPath = Paths.getDirPath(path);
    const folder = await this.itemService_.getItemByPath(dirPath);
    if (!folder) {
      return DEFAULT_METADATA;
    }

    // Check if there are any metadatas in this folder.
    const metadataItem = await this.getMetadataItemInFolder_(dirPath);
    if (metadataItem) {
      return this.resolveMetadataItem_(metadataItem);
    }

    return this.getMetadataForItem(folder.getId());
  }

  private async getMetadataItemInFolder_(path: Path): Promise<File | null> {
    const folder = await this.itemService_.getItemByPath(path);
    if (!(folder instanceof Folder)) {
      return null;
    }

    const contentPromises = folder.getItems().mapItem((id) => this.itemService_.getItem(id));
    const contents = await Promise.all(contentPromises);
    const result = contents.find((item) => {
      if (!(item instanceof File)) {
        return false;
      }

      return item.getType() === FileType.METADATA;
    }) || null;

    return result as (File | null);
  }

  private async resolveMetadataItem_(item: File): Promise<Metadata> {
    const path = await this.itemService_.getPath(item.getId());
    if (!path) {
      return this.createMetadata_(item.getContent(), '');
    }

    const contentPromises = Paths.getSubPathsToRoot(path)
        .map(async (subpath) => {
          const metadataItem = await this.getMetadataItemInFolder_(subpath);
          if (!metadataItem) {
            return '';
          }

          return metadataItem.getContent();
        });
    const contents = await Promise.all(contentPromises);
    const combinedContent = contents.reverse().filter((content) => !!content).join('\n');
    return this.createMetadata_(combinedContent, path.toString());
  }
}

export const $metadataService = staticId('metadataService', InstanceofType(MetadataService));
Graph.registerProvider(
    $metadataService,
    (itemService) => {
      return new MetadataService(itemService);
    },
    $itemService);
