import * as marked from 'marked';

export function markdown(markdownString: string): string {
  return marked(markdownString, {headerIds: true});
}
