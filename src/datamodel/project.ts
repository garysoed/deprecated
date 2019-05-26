import { SerializableProject } from '../serializable/serializable-project';
import { ItemId } from './item-id';

export class Project {
  constructor(readonly serializable: SerializableProject) { }

  get id(): string {
    return this.serializable.id;
  }

  get name(): string {
    return this.serializable.name;
  }

  get rootFolderId(): ItemId {
    return new ItemId(this.serializable.rootFolderId);
  }

  setName(newName: string): Project {
    return new Project({
      ...this.serializable,
      name: newName,
    });
  }

  update(updater: ProjectUpdater): Project {
    return new Project({
      ...this.serializable,
      ...updater.changeSerializable,
    });
  }

  get updater(): ProjectUpdater {
    return new ProjectUpdater();
  }
}

type MutablePartial<T> = {-readonly [K in keyof T]+?: T[K]};

export class ProjectUpdater {
  protected readonly projectChangeSerializable: MutablePartial<SerializableProject> = {};

  get changeSerializable(): MutablePartial<SerializableProject> {
    return this.projectChangeSerializable;
  }

  setName(newName: string): this {
    this.projectChangeSerializable.name = newName;

    return this;
  }
}
