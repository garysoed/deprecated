import { createImmutableSet, ImmutableSet } from '@gs-tools/collect';
import { SerializableFolder } from '../serializable/serializable-folder';
import { Source } from './source';
import { createSource } from './source-factory';

export class Folder {
  readonly contentIds: ImmutableSet<string>;
  readonly source: Source<any>;

  constructor(readonly serializable: SerializableFolder) {
    this.contentIds = createImmutableSet(serializable.contentIds);
    this.source = createSource(serializable.source);
  }

  get id(): string {
    return this.serializable.id;
  }

  get name(): string {
    return this.serializable.name;
  }

  setContentIds(contentIds: Iterable<string>): Folder {
    return new Folder({...this.serializable, contentIds: [...contentIds]});
  }

  setName(name: string): Folder {
    return new Folder({
      ...this.serializable,
      name,
    });
  }
}
