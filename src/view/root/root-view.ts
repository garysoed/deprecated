import { Vine } from '@grapevine';
import { ElementWithTagType, InstanceofType } from '@gs-types';
import { _p, _v, RootLayout, ThemedCustomElementCtrl } from '@mask';
import { element, InitFn, single, SingleRenderSpec } from '@persona';
import { Observable } from '@rxjs';
import { map, switchMap } from '@rxjs/operators';
import { $locationService } from '../../main/route';
import { FolderView } from '../folder/folder-view';
import { ProjectListSidebar } from '../projectlist/project-list-sidebar';
import { ProjectListView } from '../projectlist/project-list-view';
import template from './root-view.html';

export const $ = {
  main: element('main', ElementWithTagType('main'), {
    view: single('#view'),
  }),
  sidebar: element('sidebar', InstanceofType(HTMLDivElement), {
    content: single('#sidebar'),
  }),
};

@_p.customElement({
  dependencies: [
    FolderView,
    ProjectListSidebar,
    ProjectListView,
    RootLayout,
  ],
  tag: 'th-root-view',
  template,
})
export class RootView extends ThemedCustomElementCtrl {
  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.main._.view).withVine(_v.stream(this.renderView, this)),
      _p.render($.sidebar._.content).withVine(_v.stream(this.renderSidebar, this)),
    ];
  }

  private renderSidebar(vine: Vine): Observable<SingleRenderSpec|null> {
    return $locationService.get(vine)
        .pipe(
            switchMap(service => service.getLocation()),
            map(location => {
              switch (location.type) {
                case 'MAIN':
                  return {attr: new Map(), tag: 'th-project-list-sidebar'};
                case 'PROJECT':
                  return {attr: new Map(), tag: 'th-folder-sidebar'};
                default:
                  return null;
              }
            }),
        );
  }

  private renderView(vine: Vine): Observable<SingleRenderSpec|null> {
    return $locationService.get(vine)
        .pipe(
            switchMap(service => service.getLocation()),
            map(location => {
              switch (location.type) {
                case 'MAIN':
                  return {attr: new Map(), tag: 'th-project-list-view'};
                case 'PROJECT':
                  return {attr: new Map(), tag: 'th-folder-view'};
                default:
                  return null;
              }
            }),
        );
  }
}
