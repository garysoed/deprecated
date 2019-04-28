import { SetDiff } from '@gs-tools/rxjs';
import { EditableStorage, LocalStorage } from '@gs-tools/store';
import { _v } from '@mask';
import { Result, Serializable } from '@nabu/main';
import { BehaviorSubject, Observable } from '@rxjs';
import { map, shareReplay, take } from '@rxjs/operators';
import { SerializableProject, SerializableProjectType } from '../serializable/serializable-project';
import { Project } from './project';

export class ProjectCollection {
  constructor(private readonly storage: EditableStorage<SerializableProject>) { }

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

  getProjectIds(): Observable<SetDiff<string>> {
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
                rootFolderIds: [],
              });
            }),
        );
  }

  setProject(project: Project): Observable<unknown> {
    return this.storage.update(project.id, project.serializable);
  }
}

export const $projectCollection = _v.source(
    () => new BehaviorSubject(
        new ProjectCollection(
            new LocalStorage(
                window,
                'th2',
                {
                  convertBackward(serializable: Serializable): Result<SerializableProject> {
                    if (!SerializableProjectType.check(serializable)) {
                      return {success: false};
                    }

                    return {success: true, result: serializable};
                  },

                  convertForward(value: SerializableProject): Result<Serializable> {
                    return {success: true, result: {...value}};
                  },
                },
            ),
        ),
    ),
    globalThis,
);
