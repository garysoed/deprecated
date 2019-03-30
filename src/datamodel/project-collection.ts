import { staticSourceId } from '@grapevine/component';
import { ImmutableSet } from '@gs-tools/collect';
import { EditableStorage, LocalStorage } from '@gs-tools/store';
import { InstanceofType } from '@gs-types';
import { _v } from '@mask';
import { Result, Serializable } from '@nabu/main';
import { Observable } from 'rxjs';
import { map, shareReplay, take } from 'rxjs/operators';
import { SerializableProject, SerializableProjectType } from '../serializable/serializable-project';
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
    this.store_.update(project.id, project.serializable);
  }
}

export const $projectCollection =
    staticSourceId('projectCollection', InstanceofType(ProjectCollection));
_v.builder.source(
    $projectCollection,
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
);
