import { ArrayDiff } from '@gs-tools/rxjs';
import { EditableStorage, LocalStorage } from '@gs-tools/store';
import { _v } from '@mask';
import { Observable, of as observableOf } from '@rxjs';
import { map, mapTo, shareReplay, take } from '@rxjs/operators';
import { SERIALIZABLE_PROJECT_CONVERTER, SerializableProject } from '../serializable/serializable-project';
import { ItemId } from './item-id';
import { Project, projectFactory } from './project';

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

              return projectFactory.$create(projectSerializable);
            }),
            shareReplay(1),
        );
  }

  getProjectIds(): Observable<ArrayDiff<string>> {
    return this.storage.listIds();
  }

  newProject(rootFolderId: ItemId): Observable<Project> {
    return this.storage
        .generateId()
        .pipe(
            take(1),
            map(newProjectId => {
              return projectFactory.$create({
                id: newProjectId,
                name: `Project ${newProjectId}`,
                rootFolderId: rootFolderId.serializable,
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

export const $projectCollection = _v.stream(
    () => observableOf(
        new ProjectCollection(
            new LocalStorage(
                window,
                'th2.pr',
                SERIALIZABLE_PROJECT_CONVERTER,
            ),
        ),
    ),
    globalThis,
);
