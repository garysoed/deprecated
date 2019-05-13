import { SerializableProject } from '../serializable/serializable-project';

export class Project {
  constructor(readonly serializable: SerializableProject) { }

  get id(): string {
    return this.serializable.id;
  }

  get name(): string {
    return this.serializable.name;
  }

  get rootFolderId(): string {
    return this.serializable.rootFolderId;
  }

  setName(newName: string): Project {
    return new Project({
      ...this.serializable,
      name: newName,
    });
  }
}
