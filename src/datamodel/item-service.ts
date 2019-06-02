import { Vine } from '@grapevine';
import { _v } from '@mask';
import { Observable, of as observableOf } from '@rxjs';
import { switchMap } from '@rxjs/operators';
import { BaseItemId, LocalItemId } from '../serializable/item-id';
import { Item } from './item';
import { $localFolderCollection } from './local-folder-collection';
import { SourceType } from './source-type';

class ItemService {
  constructor(private readonly vine: Vine) { }

  getItem(itemId: BaseItemId): Observable<Item|null> {
    switch (itemId.source) {
      case SourceType.LOCAL:
        return $localFolderCollection.get(this.vine).pipe(
            switchMap(collection => collection.get(itemId as LocalItemId)),
        );
    }

    throw new Error('unimplemented');
  }
}

export const $itemService = _v.stream(vine => observableOf(new ItemService(vine)), globalThis);
