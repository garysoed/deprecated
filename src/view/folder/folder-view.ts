import { _p, Breadcrumb, ThemedCustomElementCtrl } from '@mask';
import template from './folder-view.html';

@_p.customElement({
  dependencies: [
    Breadcrumb,
  ],
  tag: 'th-folder-view',
  template,
})
export class FolderView extends ThemedCustomElementCtrl {

}
