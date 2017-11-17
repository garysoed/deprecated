import { BaseDisposable } from 'external/gs_tools/src/dispose';
import { Graph } from 'external/gs_tools/src/graph';
import {
  component,
  onDom,
  Persona,
  resolveSelectors,
  shadowHostSelector,
} from 'external/gs_tools/src/persona';

import { PreviewFile } from '../data/preview-file';
import { $selectedItem } from '../main/selected-folder-graph';

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
    Graph.onReady(null, $selectedItem, () => this.onSelectedItemChanged_());
    this.onSelectedItemChanged_();
  }

  private async onSelectedItemChanged_(): Promise<void> {
    const shadowRoot = Persona.getShadowRoot(this);
    if (!shadowRoot) {
      return;
    }

    const time = Graph.getTimestamp();
    const selectedItem = await Graph.get($selectedItem, time);
    if (!(selectedItem instanceof PreviewFile)) {
      shadowRoot!.innerHTML = '';
      return;
    }
    shadowRoot.innerHTML = selectedItem.getContent();
  }
}
