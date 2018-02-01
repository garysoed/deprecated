import { BaseDisposable } from 'external/gs_tools/src/dispose';
import { Graph } from 'external/gs_tools/src/graph';
import { ImmutableList } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import { Paths } from 'external/gs_tools/src/path';
import {
  component,
  onDom,
  resolveSelectors,
  shadowHostSelector,
} from 'external/gs_tools/src/persona';

import { $previewService } from '../data';

const $ = resolveSelectors({
  host: {
    el: shadowHostSelector,
  },
});

@component({
  tag: 'th-preview-view',
  templateKey: 'src/preview/preview-view',
})
export class PreviewView extends BaseDisposable {
  constructor(
      @inject('x.dom.document') private readonly document_: Document,
      @inject('x.dom.window') private readonly window_: Window,
      private readonly parser_: DOMParser = new DOMParser()) {
    super();
  }

  @onDom.event($.host.el, 'gs-connected')
  async onHostConnected_(): Promise<void> {
    const time = Graph.getTimestamp();
    const baseUrl = this.document_.baseURI || '';
    const previewPath = this.window_.location.href.slice(baseUrl.length - 1);
    const [previewService] = await Graph.getAll(time, this, $previewService);
    const previewItem = await previewService.get(Paths.absolutePath(previewPath));
    if (previewItem === null) {
      this.document_.write(`${previewPath} cannot be found`);
      return;
    }
    const dom = this.parser_.parseFromString(previewItem.getContent(), 'text/html');
    const scripts = ImmutableList.of(dom.querySelectorAll('script'));
    for (const script of scripts) {
      this.processScript_(script);
    }

    this.document_.write(dom.documentElement.outerHTML);
  }

  private async processScript_(scriptEl: HTMLScriptElement): Promise<void> {
    const src = scriptEl.src;
    if (src) {
      const code = await fetch(src);
      const codeText = await code.text();
      // tslint:disable-next-line:no-eval
      eval(codeText);
    }

    const content = scriptEl.innerText;
    if (content) {
      // tslint:disable-next-line:no-eval
      eval(content);
    }
  }
}
