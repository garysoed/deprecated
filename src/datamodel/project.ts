import { createImmutableSet, ImmutableSet } from '@gs-tools/collect';
import { SerializableProject } from '../serializable/serializable-project';

export class Project {
  readonly rootFolderIds: ImmutableSet<string>;

  constructor(readonly serializable: SerializableProject) {
    this.rootFolderIds = createImmutableSet(serializable.rootFolderIds);
  }

  get id(): string {
    return this.serializable.id;
  }

  get name(): string {
    return this.serializable.name;
  }

  setName(newName: string): Project {
    return new Project({
      ...this.serializable,
      name: newName,
    });
  }

  setRootFolderIds(newRootFolderIds: Iterable<string>): Project {
    return new Project({
      ...this.serializable,
      rootFolderIds: [...newRootFolderIds],
    });
  }
}
