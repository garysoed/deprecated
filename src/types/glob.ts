import * as glob from 'glob';
import * as yaml from 'yaml';

export class Glob {
  constructor(private readonly expr: string) { }

  async resolveFiles(root: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      glob(this.expr, {root}, (err, matches) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(matches);
      });
    });
  }
}

export const TAG = {
  tag: '!glob',
  resolve: (doc: yaml.ast.Document, cst: yaml.cst.Node) => {
    return new Glob((cst as any).strValue);
  },
  stringify: (item: yaml.ast.Node) => item.tag || '',
};
