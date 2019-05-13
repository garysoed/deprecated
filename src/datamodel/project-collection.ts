import { ArrayDiff } from '@gs-tools/rxjs';
import { EditableStorage, LocalStorage } from '@gs-tools/store';
import { _v } from '@mask';
import { BehaviorSubject, Observable } from '@rxjs';
import { map, mapTo, shareReplay, take } from '@rxjs/operators';
import { SERIALIZABLE_PROJECT_CONVERTER, SerializableProject } from '../serializable/serializable-project';
import { Project } from './project';

export class ProjectCollection {
  constructor(private readonly storage: EditableStorage<SerializableProject>) { }

  deleteProject(projectId: string): Observable<unknown> {
    return this.storage.delete(projectId);
  }

  getProject(projectId: string): Observable<Project|null> {
    return this.storage
        .read(projectId)
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

  getProjectIds(): Observable<ArrayDiff<string>> {
    return this.storage.listIds();
  }

  newProject(): Observable<Project> {
    return this.storage
        .generateId()
        .pipe(
            take(1),
            map(newProjectId => {
              return new Project({
                id: newProjectId,
                name: `Project ${newProjectId}`,
              });
            }),
            shareReplay(1),
        );
  }

  setProject(project: Project): Observable<Project> {
    return this.storage.update(project.id, project.serializable)
        .pipe(mapTo(project));
  }
}

export const $projectCollection = _v.source(
    () => new BehaviorSubject(
        new ProjectCollection(
            new LocalStorage(
                window,
                'th2',
                SERIALIZABLE_PROJECT_CONVERTER,
            ),
        ),
    ),
    globalThis,
);
