import { assert, createSpyInstance, match, setup, should, test } from '@gs-testing';
import { SimpleIdGenerator } from '@gs-tools/random';
import { scanArray } from '@gs-tools/rxjs';
import { EditableStorage, InMemoryStorage } from '@gs-tools/store';
import { BehaviorSubject } from '@rxjs';
import { SerializableProject } from '../serializable/serializable-project';
import { parseId } from './item-id';
import { Project } from './project';
import { ProjectCollection } from './project-collection';

test('@thoth/datamodel/project-collection', () => {
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
      const rootFolderId = parseId('lo_rootFolderId');
      const projectSerializable = {
        id: projectId,
        name: projectName,
        rootFolderId: rootFolderId.serializable,
      };

      storage.update(projectId, projectSerializable).subscribe();

      const projectSubject = new BehaviorSubject<Project|null>(null);
      collection.getProject(projectId).subscribe(projectSubject);

      // tslint:disable-next-line:no-non-null-assertion
      const project = projectSubject.getValue()!;
      assert(project.serializable).to.equal(match.anyObjectThat().haveProperties({
        id: projectId,
        name: projectName,
        rootFolderId: match.anyObjectThat().haveProperties(rootFolderId.serializable),
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
      const rootFolderId = parseId('lo_rootFolderId');

      storage.update(
          projectId1,
          {id: projectId1, name: 'name', rootFolderId: rootFolderId.serializable},
      ).subscribe();
      storage.update(
          projectId2,
          {id: projectId2, name: 'name', rootFolderId: rootFolderId.serializable},
      ).subscribe();
      storage.update(
          projectId3,
          {id: projectId3, name: 'name', rootFolderId: rootFolderId.serializable},
      ).subscribe();

      const projectIdsSubject = new BehaviorSubject<string[]>([]);
      collection.getProjectIds().pipe(scanArray()).subscribe(projectIdsSubject);

      assert(projectIdsSubject.getValue()).to.haveElements([projectId1, projectId2, projectId3]);
    });
  });

  test('newProject', () => {
    should(`emit with a new project`, async () => {
      const projectId1 = 'projectId1';
      const projectId2 = 'projectId2';
      const projectId3 = 'projectId3';
      const rootFolderId = parseId('lo_rootFolderId');

      storage.update(
          projectId1,
          {id: projectId1, name: 'name', rootFolderId: rootFolderId.serializable},
      ).subscribe();
      storage.update(
          projectId2,
          {id: projectId2, name: 'name', rootFolderId: rootFolderId.serializable},
      ).subscribe();
      storage.update(
          projectId3,
          {id: projectId3, name: 'name', rootFolderId: rootFolderId.serializable},
      ).subscribe();

      const projectIdsSubject = new BehaviorSubject<string[]>([]);
      collection.getProjectIds().pipe(scanArray()).subscribe(projectIdsSubject);

      const newProject = await collection.newProject(rootFolderId).toPromise();

      assert(new Set([projectId1, projectId2, projectId3]).has(newProject.id)).to.beFalse();
    });
  });

  test('setProject', () => {
    should(`update the project`, () => {
      const projectId = 'projectId';
      const rootFolderId = parseId('lo_rootFolderId');

      const projectIdsSubject = new BehaviorSubject<string[]>([]);
      collection.getProjectIds().pipe(scanArray()).subscribe(projectIdsSubject);

      collection
          .setProject(
              new Project({
                id: projectId,
                name: 'project',
                rootFolderId: rootFolderId.serializable,
              }),
          )
          .subscribe();

      assert(projectIdsSubject.getValue()).to.haveElements([projectId]);
    });
  });
});
