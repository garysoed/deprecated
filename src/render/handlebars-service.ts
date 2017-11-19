import { Templates } from 'external/gs_tools/src/webc';

export class HandlebarsServiceClass {
  private readonly templates_: Templates = Templates.newInstance();

  render(content: string): string {
    const template = this.templates_.getTemplate('src/render/render-default-template');
    return Handlebars.compile(template)({$mainContent: content});
  }
}

export const HandlebarsService = new HandlebarsServiceClass();
