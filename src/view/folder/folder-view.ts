import { _p, Drawer, TextIconButton, ThemedCustomElementCtrl } from '@mask';
import template from './folder-view.html';

@_p.customElement({
  dependencies: [
    Drawer,
    TextIconButton,
  ],
  tag: 'th-folder-view',
  template,
})
export class FolderView extends ThemedCustomElementCtrl {

}
