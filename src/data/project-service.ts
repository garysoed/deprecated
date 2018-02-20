import { InstanceofType } from 'external/gs_tools/src/check';
import { DataGraph } from 'external/gs_tools/src/datamodel';
import { Graph, staticId } from 'external/gs_tools/src/graph';

import { Item } from '../data/item';
import { $items } from '../data/item-graph';
import { Project } from '../data/project';
import { $project } from '../data/project-graph';

export const PROJECT_ID = '$p';

export class ProjectService {
  constructor(
      private readonly itemsGraph_: DataGraph<Item>,
      private readonly projectsGraph_: DataGraph<Project>) { }

  async get(): Promise<Project> {
    const project = await this.projectsGraph_.get(PROJECT_ID);
    if (project) {
      return project;
    }

    const rootFolderId = await this.itemsGraph_.generateId();
    const newProject = Project.newInstance(rootFolderId);
    await this.set(newProject);
    return newProject;
  }

  async set(project: Project): Promise<void> {
    return this.projectsGraph_.set(PROJECT_ID, project);
  }
}

export const $projectService = staticId('projectService', InstanceofType(ProjectService));
Graph.registerProvider(
    $projectService,
    (itemsGraph, projectsGraph) => {
      return new ProjectService(itemsGraph, projectsGraph);
    },
    $items,
    $project);
