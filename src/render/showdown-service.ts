import { cache } from 'external/gs_tools/src/data';
import { ImmutableMap } from 'external/gs_tools/src/immutable';

export class ShowdownServiceClass {
  @cache()
  private getConverter_(): showdown.Converter {
    return new showdown.Converter({
      tasklists: true,
    });
  }

  render(raw: string, options: ImmutableMap<string, string>): string {
    const converter = this.getConverter_();
    for (const [key, value] of options) {
      converter.setOption(key, value);
    }
    return converter.makeHtml(raw);
  }
}

export const ShowdownService = new ShowdownServiceClass();
