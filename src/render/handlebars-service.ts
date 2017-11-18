export class HandlebarsServiceClass {
  render(template: string): string {
    return Handlebars.compile(template)({});
  }
}

export const HandlebarsService = new HandlebarsServiceClass();
