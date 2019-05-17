import { Vine } from '@grapevine';
import { ElementWithTagType } from '@gs-types';
import { $dialogService, $textIconButton, _p, _v, Dialog, Drawer, RootLayout, ThemedCustomElementCtrl } from '@mask';
import { api, element, InitFn, single, SingleRenderSpec } from '@persona';
import { Observable } from '@rxjs';
import { map, shareReplay, switchMap } from '@rxjs/operators';
import { $locationService } from '../../main/route';
import { FolderView } from '../folder/folder-view';
import { AddProjectDialog, openDialog as openAddProjectDialog } from '../projectlist/add-project-dialog';
import { ProjectListView } from '../projectlist/project-list-view';
import template from './root-view.html';

export const $ = {
  addProject: element(
      'addProject',
      ElementWithTagType('mk-text-icon-button'),
      api($textIconButton),
  ),
  main: element('main', ElementWithTagType('main'), {
    view: single('#view'),
  }),
};

@_p.customElement({
  dependencies: [
    AddProjectDialog,
    Dialog,
    Drawer,
    FolderView,
    ProjectListView,
    RootLayout,
  ],
  tag: 'th-root-view',
  template,
})
export class RootView extends ThemedCustomElementCtrl {
  private readonly onAddProjectAction = _p.input($.addProject._.actionEvent, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.addProject._.disabled).withVine(_v.stream(this.renderAddProjectDisabled, this)),
      _p.render($.main._.view).withVine(_v.stream(this.renderView, this)),
      this.setupOnAddProjectAction,
    ];
  }

  private renderAddProjectDisabled(vine: Vine): Observable<boolean> {
    return $dialogService.get(vine)
        .pipe(
            switchMap(service => service.getStateObs()),
            map(({isOpen}) => isOpen),
            shareReplay(1),
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

  private setupOnAddProjectAction(vine: Vine): Observable<unknown> {
    return this.onAddProjectAction.pipe(
        switchMap(() => openAddProjectDialog(vine)),
    );
  }
}
