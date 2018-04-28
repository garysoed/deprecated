import { ImmutableMap } from 'external/gs_tools/src/immutable';

export class HandlebarsServiceClass {
  render(
      context: {},
      template: string,
      globals: Iterable<[string, string]> = ImmutableMap.of({})): string {
    const globalContexts = {};
    for (const [key, value] of globals) {
      globalContexts[key] = value;
    }

    Handlebars.registerHelper('debug', (input: any) => JSON.stringify(input, undefined, 2));
    return Handlebars.compile(template)({...globalContexts, ...context});
  }
}

export const HandlebarsService = new HandlebarsServiceClass();
