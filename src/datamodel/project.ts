import { ImmutableSet } from 'gs-tools/export/collect';
import { SerializableProject } from '../serializable/serializable-project';

export class Project {
  private readonly rootFolderIds_: ImmutableSet<string>;

  constructor(readonly serializable_: SerializableProject) {
    this.rootFolderIds_ = ImmutableSet.of(serializable_.rootFolderIds);
  }

  getId(): string {
    return this.serializable_.id;
  }

  getName(): string {
    return this.serializable_.name;
  }

  getRootFolderIds(): ImmutableSet<string> {
    return this.rootFolderIds_;
  }

  setName(newName: string): Project {
    return new Project({
      ...this.serializable_,
      name: newName,
    });
  }

  setRootFolderIds(newRootFolderIds: ImmutableSet<string>): Project {
    return new Project({
      ...this.serializable_,
      rootFolderIds: [...newRootFolderIds],
    });
  }
}
