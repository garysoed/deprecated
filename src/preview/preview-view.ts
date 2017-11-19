import { BaseDisposable } from 'external/gs_tools/src/dispose';
import { Graph } from 'external/gs_tools/src/graph';
import { ImmutableList } from 'external/gs_tools/src/immutable';
import {
  component,
  onDom,
  Persona,
  resolveSelectors,
  shadowHostSelector,
} from 'external/gs_tools/src/persona';
import { $location } from 'external/gs_tools/src/ui';

import { ItemService } from '../data';

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
  @onDom.event($.host.el, 'gs-connected')
  onHostConnected_(): void {
    Graph.onReady(null, $location.path, () => this.onLocationChanged_());
    this.onLocationChanged_();
  }

  private async onLocationChanged_(): Promise<void> {
    const shadowRoot = Persona.getShadowRoot(this);
    if (!shadowRoot) {
      return;
    }

    const time = Graph.getTimestamp();
    const selectedItemId = await Graph.get($location.path, time);
    const previewItem = await ItemService.getPreview(time, selectedItemId);
    if (previewItem === null) {
      shadowRoot!.innerHTML = '';
      return;
    }
    shadowRoot.innerHTML = previewItem.getContent();
    const scripts = ImmutableList.of(shadowRoot.querySelectorAll('script'));
    for (const script of scripts) {
      const src = script.src;
      if (src) {
        const code = await fetch(src);
        const codeText = await code.text();
        eval(codeText);
      }

      const content = script.innerText;
      if (content) {
        eval(content);
      }
    }
  }
}
