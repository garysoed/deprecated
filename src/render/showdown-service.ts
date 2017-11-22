import { cache } from 'external/gs_tools/src/data';

export class ShowdownServiceClass {
  @cache()
  private getConverter_(): showdown.Converter {
    return new showdown.Converter({
      tasklists: true,
    });
  }

  render(raw: string): string {
    return this.getConverter_().makeHtml(raw);
  }
}

export const ShowdownService = new ShowdownServiceClass();
