import { cache } from 'external/gs_tools/src/data';

export class ShowdownHandlerClass {
  @cache()
  private getConverter_(): showdown.Converter {
    return new showdown.Converter();
  }

  render(raw: string): string {
    return this.getConverter_().makeHtml(raw);
  }
}

export const ShowdownService = new ShowdownHandlerClass();
