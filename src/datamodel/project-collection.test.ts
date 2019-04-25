import { SimpleIdGenerator } from '@gs-tools/random';
import { scanSet } from '@gs-tools/rxjs';
import { EditableStorage, InMemoryStorage } from '@gs-tools/store';
import { assert, match, setup, should, test } from 'gs-testing/export/main';
import { createSpyInstance } from 'gs-testing/export/spy';
import { BehaviorSubject } from 'rxjs';
import { SerializableProject } from '../serializable/serializable-project';
import { Project } from './project';
import { ProjectCollection } from './project-collection';

test('datamodel.ProjectCollection', () => {
  let storage: EditableStorage<SerializableProject>;
  let collection: ProjectCollection;

  setup(() => {
    storage = new InMemoryStorage(new SimpleIdGenerator());
    collection = new ProjectCollection(storage);
  });

  test('getProject', () => {
    should(`emit the correct project`, () => {
      const projectId = 'projectId';
      const projectName = `Test Project`;
      const rootFolder1 = 'rootFolder1';
      const rootFolder2 = 'rootFolder2';
      const projectSerializable = {
        id: projectId,
        name: projectName,
        rootFolderIds: ['rootFolder1', 'rootFolder2'],
      };

      storage.update(projectId, projectSerializable).subscribe();

      const projectSubject = new BehaviorSubject<Project|null>(null);
      collection.getProject(projectId).subscribe(projectSubject);

      // tslint:disable-next-line:no-non-null-assertion
      const project = projectSubject.getValue()!;
      assert(project.serializable).to.equal(match.anyObjectThat().haveProperties({
        id: projectId,
        name: projectName,
        rootFolderIds: match.anyArrayThat().haveExactElements([rootFolder1, rootFolder2]),
      }));
    });

    should(`emit null if the project does not exist`, () => {
      const projectSubject = new BehaviorSubject<Project|null>(createSpyInstance(Project));
      collection.getProject('projectId').subscribe(projectSubject);

      assert(projectSubject.getValue()).to.beNull();
    });
  });

  test('getProjectIds', () => {
    should(`emit the correct IDs`, () => {
      const projectId1 = 'projectId1';
      const projectId2 = 'projectId2';
      const projectId3 = 'projectId3';

      storage.update(projectId1, {id: projectId1, name: 'name', rootFolderIds: []}).subscribe();
      storage.update(projectId2, {id: projectId2, name: 'name', rootFolderIds: []}).subscribe();
      storage.update(projectId3, {id: projectId3, name: 'name', rootFolderIds: []}).subscribe();

      const projectIdsSubject = new BehaviorSubject<Set<string>>(new Set());
      collection.getProjectIds().pipe(scanSet()).subscribe(projectIdsSubject);

      assert(projectIdsSubject.getValue()).to.haveElements([projectId1, projectId2, projectId3]);
    });
  });

  test('newProject', () => {
    should(`emit with a new project`, async () => {
      const projectId1 = 'projectId1';
      const projectId2 = 'projectId2';
      const projectId3 = 'projectId3';

      storage.update(projectId1, {id: projectId1, name: 'name', rootFolderIds: []}).subscribe();
      storage.update(projectId2, {id: projectId2, name: 'name', rootFolderIds: []}).subscribe();
      storage.update(projectId3, {id: projectId3, name: 'name', rootFolderIds: []}).subscribe();

      const projectIdsSubject = new BehaviorSubject(new Set());
      collection.getProjectIds().pipe(scanSet()).subscribe(projectIdsSubject);

      const newProject = await collection.newProject().toPromise();

      assert(new Set([projectId1, projectId2, projectId3]).has(newProject.id)).to.beFalse();
    });
  });

  test('setProject', () => {
    should(`update the project`, () => {
      const projectId = 'projectId';

      const projectIdsSubject = new BehaviorSubject(new Set());
      collection.getProjectIds().pipe(scanSet()).subscribe(projectIdsSubject);

      collection
          .setProject(new Project({
            id: projectId,
            name: 'project',
            rootFolderIds: [],
          }))
          .subscribe();

      assert(projectIdsSubject.getValue()).to.haveElements([projectId]);
    });
  });
});
