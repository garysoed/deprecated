import { BaseDisposable } from 'external/gs_tools/src/dispose';
import { Graph } from 'external/gs_tools/src/graph';
import { ImmutableList } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import {
  component,
  onDom,
  Persona,
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
      @inject('x.dom.window') private readonly window_: Window) {
    super();
  }

  @onDom.event($.host.el, 'gs-connected')
  async onHostConnected_(): Promise<void> {
    const shadowRoot = Persona.getShadowRoot(this);
    if (!shadowRoot) {
      return;
    }

    const time = Graph.getTimestamp();
    const baseUrl = this.document_.baseURI || '';
    const previewPath = this.window_.location.href.slice(baseUrl.length - 1);
    const [previewService] = await Graph.getAll(time, this, $previewService);
    const previewItem = await previewService.get(previewPath);
    if (previewItem === null) {
      shadowRoot!.innerHTML = `${previewPath} cannot be found`;
      return;
    }
    shadowRoot.innerHTML = previewItem.getContent();
    const scripts = ImmutableList.of(shadowRoot.querySelectorAll('script'));
    for (const script of scripts) {
      this.processScript_(script);
    }
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
