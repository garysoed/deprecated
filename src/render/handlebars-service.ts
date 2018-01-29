import { ImmutableMap } from 'external/gs_tools/src/immutable';

export class HandlebarsServiceClass {
  render(
      content: string,
      template: string,
      globals: Iterable<[string, string]> = ImmutableMap.of({})): string {
    const context = {
      $mainContent: content,
    };
    for (const [key, value] of globals) {
      context[key] = value;
    }
    return Handlebars.compile(template)(context);
  }
}

export const HandlebarsService = new HandlebarsServiceClass();
