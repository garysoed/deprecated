import { _p, Config, iconWithText, textIconButton, ThemedCustomElementCtrl } from 'mask/export';
import { ICON_CONFIG } from '../../config/icon-config';
import projectListViewTemplate from './project-list-view.html';

@_p.customElement({
  tag: 'th-project-list-view',
  template: projectListViewTemplate,
})
class ProjectListView extends ThemedCustomElementCtrl {

}

export function projectListView(): Config {
  return {
    dependencies: [textIconButton(iconWithText(ICON_CONFIG))],
    tag: 'th-project-list-view',
  };
}
