import { _p, Config, drawer, iconWithText, textIconButton, ThemedCustomElementCtrl } from 'mask/export';
import { ICON_CONFIG } from '../../config/icon-config';
import template from './folder-view.html';

@_p.customElement({
  tag: 'th-folder-view',
  template,
})
class FolderView extends ThemedCustomElementCtrl {

}

export function folderViewConfig(): Config {
  return {
    dependencies: [drawer(), textIconButton(iconWithText(ICON_CONFIG))],
    tag: 'th-folder-view',
  };
}
