import { _p, Drawer, RootLayout, ThemedCustomElementCtrl } from 'mask/export';
import template from './root-view.html';

@_p.customElement({
  dependencies: [Drawer, RootLayout],
  tag: 'th-root-view',
  template,
})
export class RootView extends ThemedCustomElementCtrl {

}
