import { assert, TestBase } from '../test-base';
TestBase.setup();

import { FakeDataGraph } from 'external/gs_tools/src/datamodel';
import { FLAGS as GraphFlags, Graph } from 'external/gs_tools/src/graph';

import { ItemService, Project, ProjectService } from '../data';
import { $project } from '../data/project-graph';
import { PROJECT_ID } from '../data/project-service';


describe('data.ProjectService', () => {
  beforeEach(() => {
    GraphFlags.checkValueType = false;
  });

  afterEach(() => {
    GraphFlags.checkValueType = true;
  });

  describe('get', () => {
    it(`should create the project and return it if project does not exist`, async () => {
      const projectGraph = new FakeDataGraph<Project>();
      Graph.clearNodesForTests([$project]);
      Graph.createProvider($project, projectGraph);

      const rootFolderId = 'rootFolderId';
      spyOn(ItemService, 'newId').and.returnValue(Promise.resolve(rootFolderId));
      spyOn(ProjectService, 'set');

      const time = Graph.getTimestamp();

      const project = await ProjectService.get(time);
      assert(project.getRootFolderId()).to.equal(rootFolderId);
      assert(ProjectService.set).to.haveBeenCalledWith(project, time);
      assert(ItemService.newId).to.haveBeenCalledWith(time);
    });

    it(`should return the existing project`, async () => {
      const project = Project.newInstance('rootFolderId');
      const projectGraph = new FakeDataGraph<Project>();
      projectGraph.set(PROJECT_ID, project);
      Graph.clearNodesForTests([$project]);
      Graph.createProvider($project, projectGraph);

      spyOn(ItemService, 'newId');
      spyOn(ProjectService, 'set');

      const time = Graph.getTimestamp();

      assert(await ProjectService.get(time)).to.equal(project);
      assert(ProjectService.set).toNot.haveBeenCalled();
      assert(ItemService.newId).toNot.haveBeenCalled();
    });
  });

  describe('set', () => {
    it(`should update the project correctly`, async () => {
      const projectGraph = new FakeDataGraph<Project>();
      Graph.clearNodesForTests([$project]);
      Graph.createProvider($project, projectGraph);

      spyOn(ItemService, 'newId');

      const project = Project.newInstance('rootFolderId');
      const time = Graph.getTimestamp();

      await ProjectService.set(project, time);
      assert(await projectGraph.get(PROJECT_ID)).to.equal(project);
    });
  });
});
