import { Graph, GraphTime } from 'external/gs_tools/src/graph';

import { ItemService } from '../data/item-service';
import { Project } from '../data/project';
import { $project } from '../data/project-graph';

export const PROJECT_ID = '$p';

export class ProjectServiceClass {
  async get(time: GraphTime): Promise<Project> {
    const projectGraph = await Graph.get($project, time);
    const project = await projectGraph.get(PROJECT_ID);
    if (project) {
      return project;
    }

    const rootFolderId = await ItemService.newId(time);
    const newProject = Project.newInstance(rootFolderId);
    await this.set(newProject, time);
    return newProject;
  }

  async set(project: Project, time: GraphTime): Promise<void> {
    const projectGraph = await Graph.get($project, time);
    return projectGraph.set(PROJECT_ID, project);
  }
}

export const ProjectService = new ProjectServiceClass();
