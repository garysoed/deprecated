import { _p, Drawer, ThemedCustomElementCtrl } from 'mask/export';
import template from './root-view.html';

@_p.customElement({
  dependencies: [Drawer],
  tag: 'th-root-view',
  template,
})
export class RootView extends ThemedCustomElementCtrl {

}
