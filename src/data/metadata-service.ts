import { InstanceofType } from 'external/gs_tools/src/check';
import { Graph, staticId } from 'external/gs_tools/src/graph';
import { Path, Paths } from 'external/gs_tools/src/path';

import { File } from '../data/file';
import { FileType } from '../data/file-type';
import { Folder } from '../data/folder';
import { $itemService, ItemService } from '../data/item-service';
import { Metadata } from '../data/metadata';

export class MetadataService {
  constructor(private readonly itemService_: ItemService) { }

  async getMetadataForItem(itemId: string): Promise<Metadata | null> {
    const path = await this.itemService_.getPath(itemId);
    if (!path) {
      return null;
    }

    const dirPath = Paths.getDirPath(path);
    const folder = await this.itemService_.getItemByPath(dirPath);
    if (!folder) {
      return null;
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
      return new Metadata(item.getContent());
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
    return new Metadata(combinedContent);
  }
}

export const $metadataService = staticId('metadataService', InstanceofType(MetadataService));
Graph.registerProvider(
    $metadataService,
    (itemService) => {
      return new MetadataService(itemService);
    },
    $itemService);
