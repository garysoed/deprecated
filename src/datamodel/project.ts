import { generateImmutable, Immutable } from '@gs-tools/immutable';
import { SerializableProject } from '../serializable/serializable-project';
import { ItemId } from './item-id';

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

  get rootFolderId(): ItemId {
    return new ItemId(this.serializable.rootFolderId);
  }
}

export const projectFactory = generateImmutable(ProjectSpec);

export type Project = Immutable<ProjectSpec, SerializableProject>;
