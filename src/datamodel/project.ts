import { generateImmutable, Immutable } from '@gs-tools/immutable';
import { LocalItemId } from '../serializable/item-id';
import { SerializableProject } from '../serializable/serializable-project';

export class ProjectSpec {
  constructor(readonly serializable: SerializableProject) { }

  get id(): string {
    return this.serializable.id;
  }

  get name(): string {
    return this.serializable.name;
  }
  set name(newName: string) {
    this.serializable.name = newName;
  }

  get rootFolderId(): LocalItemId {
    return this.serializable.rootFolderId;
  }
}

export const projectFactory = generateImmutable(ProjectSpec);

export type Project = Immutable<ProjectSpec, SerializableProject>;
