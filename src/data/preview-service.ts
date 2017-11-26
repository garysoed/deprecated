import { InstanceofType } from 'external/gs_tools/src/check';
import { DataGraph } from 'external/gs_tools/src/datamodel';
import { Graph, staticId } from 'external/gs_tools/src/graph';

import { PreviewFile } from '../data/preview-file';
import { $previews } from '../data/preview-graph';

export class PreviewService {
  constructor(private readonly previewGraph_: DataGraph<PreviewFile>) { }

  get(path: string): Promise<PreviewFile | null> {
    return this.previewGraph_.get(path);
  }

  newId(): Promise<string> {
    return this.previewGraph_.generateId();
  }

  async save(...previewFiles: PreviewFile[]): Promise<void> {
    for (const file of previewFiles) {
      this.previewGraph_.set(file.getPath(), file);
    }
  }
}

export const $previewService = staticId('previewService', InstanceofType(PreviewService));
Graph.registerProvider(
    $previewService,
    (previewGraph) => {
      return new PreviewService(previewGraph);
    },
    $previews);
