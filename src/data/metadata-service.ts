import {
  HasPropertiesType,
  InstanceofType,
  ObjectType,
  StringType,
  UndefinedType,
  UnionType } from 'external/gs_tools/src/check';
import { Errors } from 'external/gs_tools/src/error';
import { Graph, staticId } from 'external/gs_tools/src/graph';
import { ImmutableMap } from 'external/gs_tools/src/immutable';
import { AbsolutePath, AbsolutePathParser, Path, Paths } from 'external/gs_tools/src/path';

import { File } from '../data/file';
import { FileType } from '../data/file-type';
import { Folder } from '../data/folder';
import { $itemService, ItemService } from '../data/item-service';
import { Metadata } from '../data/metadata';

export const DEFAULT_METADATA = new Metadata(
    ImmutableMap.of({}),
    ImmutableMap.of({}),
    ImmutableMap.of({}));

type ShowdownConfig =  {[key: string]: string};
type MetadataJsonType = {
  globals?: {[key: string]: string},
  showdown?: {[key: string]: ShowdownConfig},
  templates?: {[key: string]: string},
};
const METADATA_JSON_TYPE = HasPropertiesType<MetadataJsonType>({
  'globals': UnionType.builder<undefined | {[key: string]: string}>()
      .addType(UndefinedType)
      .addType(ObjectType.stringKeyed<string>(StringType))
      .build(),
  'showdown': UnionType.builder<undefined | {[key: string]: ShowdownConfig}>()
      .addType(UndefinedType)
      .addType(ObjectType.stringKeyed<{[key: string]: string}>(
          ObjectType.stringKeyed<string>(StringType)))
      .build(),
  'templates': UnionType.builder<undefined | {[key: string]: string}>()
      .addType(UndefinedType)
      .addType(ObjectType.stringKeyed<string>(StringType))
      .build(),
});

export class MetadataService {
  constructor(private readonly itemService_: ItemService) { }

  private createMetadata_(unparsedContent: string, metadataPath: string): Metadata {
    const parsedContent = jsyaml.load(unparsedContent);
    if (!METADATA_JSON_TYPE.check(parsedContent)) {
      throw Errors.assert(`content of metadata [${metadataPath}]`).shouldBeA(METADATA_JSON_TYPE)
          .butWas(parsedContent);
    }

    const templates = ImmutableMap.of(parsedContent.templates || {})
        .map((value) => AbsolutePathParser.parse(value))
        .filter((value) => !!value) as ImmutableMap<string, AbsolutePath>;

    return new Metadata(
        ImmutableMap.of(parsedContent.globals || {}),
        ImmutableMap
            .of(parsedContent.showdown || {})
            .map((value) => ImmutableMap.of(value)),
        templates);
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

  private async getMetadataItemInFolder_(path: Path): Promise<File<any> | null> {
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

    return result as (File<any> | null);
  }

  private async resolveMetadataItem_(item: File<any>): Promise<Metadata> {
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
