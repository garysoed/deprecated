import * as yaml from 'yaml';

export class Glob {
  constructor(private readonly expr: string) { }

  toString(): string {
    return `Glob(${this.expr})`;
  }
}

export const TAG = {
  tag: '!glob',
  resolve: (doc: yaml.ast.Document, cst: yaml.cst.Node) => {
    return new Glob((cst as any).strValue);
  },
  stringify: (item: yaml.ast.Node) => item.tag || '',
};
