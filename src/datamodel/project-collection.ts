import { ImmutableSet } from 'gs-tools/export/collect';
import { EditableStorage } from 'gs-tools/export/store';
import { Observable } from 'rxjs';
import { map, shareReplay, take } from 'rxjs/operators';
import { SerializableProject } from '../serializable/serializable-project';
import { Project } from './project';

export class ProjectCollection {
  constructor(private readonly store_: EditableStorage<SerializableProject>) { }

  getProject(projectId: string): Observable<Project|null> {
    return this.store_.read(projectId)
        .pipe(
            map(projectSerializable => {
              if (!projectSerializable) {
                return null;
              }

              return new Project(projectSerializable);
            }),
            shareReplay(1),
        );
  }

  getProjectIds(): Observable<ImmutableSet<string>> {
    return this.store_.listIds();
  }

  newProject(): Observable<Project> {
    return this.store_
        .generateId()
        .pipe(
            take(1),
            map(newProjectId => {
              return new Project({
                id: newProjectId,
                name: `Project ${newProjectId}`,
                rootFolderIds: [],
              });
            }),
        );
  }

  setProject(project: Project): void {
    this.store_.update(project.getId(), project.serializable_);
  }
}
