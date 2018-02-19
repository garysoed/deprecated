import { assert, TestBase } from '../test-base';
TestBase.setup();

import { FakeDataGraph } from 'external/gs_tools/src/datamodel';

import { Item, Project, ProjectService } from '../data';
import { PROJECT_ID } from '../data/project-service';


describe('data.ProjectService', () => {
  let itemsGraph: FakeDataGraph<Item<any>>;
  let projectsGraph: FakeDataGraph<Project>;
  let service: ProjectService;

  beforeEach(() => {
    itemsGraph = new FakeDataGraph<Item<any>>();
    projectsGraph = new FakeDataGraph<Project>();
    service = new ProjectService(itemsGraph, projectsGraph);
  });

  describe('get', () => {
    it(`should create the project and return it if project does not exist`, async () => {
      const rootFolderId = 'rootFolderId';
      spyOn(itemsGraph, 'generateId').and.returnValue(Promise.resolve(rootFolderId));
      spyOn(service, 'set');

      const project = await service.get();
      assert(project.getRootFolderId()).to.equal(rootFolderId);
      assert(service.set).to.haveBeenCalledWith(project);
      assert(itemsGraph.generateId).to.haveBeenCalledWith();
    });

    it(`should return the existing project`, async () => {
      const project = Project.newInstance('rootFolderId');
      projectsGraph.set(PROJECT_ID, project);

      spyOn(itemsGraph, 'generateId');
      spyOn(service, 'set');

      assert(await service.get()).to.equal(project);
      assert(service.set).toNot.haveBeenCalled();
      assert(itemsGraph.generateId).toNot.haveBeenCalled();
    });
  });

  describe('set', () => {
    it(`should update the project correctly`, async () => {
      spyOn(itemsGraph, 'generateId');

      const project = Project.newInstance('rootFolderId');

      await service.set(project);
      assert(await projectsGraph.get(PROJECT_ID)).to.equal(project);
    });
  });
});
