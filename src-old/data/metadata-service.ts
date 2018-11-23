import {
  AnyType,
  HasPropertiesType,
  InstanceofType,
  ObjectType,
  StringType,
  UndefinedType,
  UnionType } from 'external/gs_tools/src/check';
import { Errors } from 'external/gs_tools/src/error';
import { Graph, staticId } from 'external/gs_tools/src/graph';
import { ImmutableList, ImmutableMap } from 'external/gs_tools/src/immutable';
import { AbsolutePath, Path, Paths } from 'external/gs_tools/src/path';

import { Folder } from '../data/folder';
import { $itemService, ItemService } from '../data/item-service';
import { MetadataFile } from '../data/metadata-file';
import { RenderConfig } from '../data/render-config';

export const DEFAULT_METADATA_FILENAME = '$default.yml';
export const DEFAULT_CONFIG: RenderConfig = {
  processor: null,
  showdownConfig: ImmutableMap.of({}),
  template: null,
  variables: ImmutableMap.of({}),
};

type ShowdownConfig =  {[key: string]: string};
type MetadataJsonType = {
  processor?: string,
  showdown?: ShowdownConfig,
  template?: string,
  variables?: {[key: string]: string},
};
const METADATA_JSON_TYPE = HasPropertiesType<MetadataJsonType>({
  'processor': UnionType.builder<undefined | string>()
      .addType(StringType)
      .addType(UndefinedType)
      .build(),
  'showdown': UnionType.builder<undefined | {[key: string]: string}>()
      .addType(UndefinedType)
      .addType(ObjectType.stringKeyed<string>(StringType))
      .build(),
  'template': UnionType.builder<undefined | string>()
      .addType(StringType)
      .addType(UndefinedType)
      .build(),
  'variables': UnionType.builder<undefined | {[key: string]: string}>()
      .addType(UndefinedType)
      .addType(ObjectType.stringKeyed<string>(AnyType()))
      .build(),
});

export class MetadataService {
  constructor(private readonly itemService_: ItemService) { }

  private createConfig_(unparsedContent: string, metadataPath: AbsolutePath): RenderConfig {
    const parsedContent = unparsedContent ? jsyaml.load(unparsedContent, {json: true}) : {};
    if (!METADATA_JSON_TYPE.check(parsedContent)) {
      throw Errors.assert(`content of metadata for file [${metadataPath}]`)
          .shouldBeA(METADATA_JSON_TYPE)
          .butWas(JSON.stringify(parsedContent));
    }

    const directoryPath = Paths.getDirPath(metadataPath);
    const templateString = parsedContent.template;
    const processorString = parsedContent.processor;
    return {
      processor: processorString ?
          Paths.join(directoryPath, Paths.relativePath(processorString)) :
          null,
      showdownConfig: ImmutableMap.of(parsedContent.showdown || {}),
      template: templateString ?
          Paths.join(directoryPath, Paths.relativePath(templateString)) :
          null,
      variables: ImmutableMap.of(parsedContent.variables || {}),
    };
  }

  async getConfigForItem(itemId: string): Promise<RenderConfig> {
    const [path, item] = await Promise.all([
      this.itemService_.getPath(itemId),
      this.itemService_.getItem(itemId),
    ]);

    if (!path || !item) {
      return DEFAULT_CONFIG;
    }

    const dirPath = Paths.getDirPath(path);
    const folder = await this.itemService_.getItemByPath(dirPath);
    if (!folder) {
      return DEFAULT_CONFIG;
    }

    // Check if there are any metadatas in this folder.
    const itemMetadataName = Paths.setFilenameExt(item.getName(), 'yml');
    const itemMetadataPromise = this.getMetadataWithNameInFolder_(itemMetadataName, dirPath);
    const defaultMetadataPromise =
        this.getMetadataWithNameInFolder_(DEFAULT_METADATA_FILENAME, dirPath);

    // Now get the ancestors.
    const ancestorMetadataPromises = Paths
        .getSubPathsToRoot(Paths.getDirPath(Paths.getDirPath(path)))
        .map(async (subpath) => {
          return this.getMetadataWithNameInFolder_(DEFAULT_METADATA_FILENAME, subpath);
        });
    const metadataPromises: Promise<MetadataFile | null>[] = [
      itemMetadataPromise,
      defaultMetadataPromise,
      ...ancestorMetadataPromises,
    ];

    const contentList = ImmutableList
        .of(await Promise.all(metadataPromises))
        .reverse()
        .filterByType(InstanceofType(MetadataFile))
        .map((metadataFile) => metadataFile.getContent());
    return this.createConfig_([...contentList].join('\n'), path);
  }

  private async getMetadataWithNameInFolder_(
      metadataName: string, path: Path): Promise<MetadataFile | null> {
    const folder = await this.itemService_.getItemByPath(path);
    if (!(folder instanceof Folder)) {
      return null;
    }

    const contentPromises = folder.getItems().mapItem((id) => this.itemService_.getItem(id));
    return ImmutableList
        .of(await Promise.all(contentPromises))
        .filterByType(InstanceofType(MetadataFile))
        .find((item) => item.getName() === metadataName);
  }
}

export const $metadataService = staticId('metadataService', InstanceofType(MetadataService));
Graph.registerProvider(
    $metadataService,
    (itemService) => {
      return new MetadataService(itemService);
    },
    $itemService);
