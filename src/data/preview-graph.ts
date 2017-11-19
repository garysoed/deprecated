import { registerDataGraph, Searcher } from 'external/gs_tools/src/datamodel';
import { ImmutableList, ImmutableSet } from 'external/gs_tools/src/immutable';
import { DataModelParser } from 'external/gs_tools/src/parse';
import { LocalStorage } from 'external/gs_tools/src/store';

import { PreviewFile } from '../data/preview-file';

class PreviewSearcher implements Searcher<PreviewFile> {
  private readonly index_: Map<string, PreviewFile> = new Map();

  async index(data: Promise<ImmutableSet<PreviewFile>>): Promise<void> {
    const items = await data;
    this.index_.clear();
    for (const item of items) {
      this.index_.set(item.getId(), item);
    }
  }

  async search(token: string): Promise<ImmutableList<PreviewFile>> {
    const item = this.index_.get(token);
    if (!item) {
      return ImmutableList.of([]);
    }

    return ImmutableList.of([item]);
  }
}

export const $previews = registerDataGraph<PreviewFile>(
    'previews',
    new PreviewSearcher(),
    new LocalStorage<PreviewFile>(window, 'th-p', DataModelParser<PreviewFile>()));
