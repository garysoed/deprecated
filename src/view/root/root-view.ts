import { _p, Config, drawer, ThemedCustomElementCtrl } from 'mask/export';
import template from './root-view.html';

@_p.customElement({
  tag: 'th-root-view',
  template,
})
class RootView extends ThemedCustomElementCtrl {

}

export function rootViewConfig(): Config {
  return {
    dependencies: [drawer()],
    tag: 'th-root-view',
  };
}
