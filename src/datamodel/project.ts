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
}
