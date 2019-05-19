import { Vine } from '@grapevine';
import { ElementWithTagType } from '@gs-types';
import { $dialogService, $textIconButton, _p, _v, ThemedCustomElementCtrl } from '@mask';
import { api, element, InitFn } from '@persona';
import { Observable } from '@rxjs';
import { map, shareReplay, switchMap } from '@rxjs/operators';
import { AddProjectDialog, openDialog as openAddProjectDialog } from '../projectlist/add-project-dialog';
import template from './project-list-sidebar.html';

export const $ = {
  addProject: element(
      'addProject',
      ElementWithTagType('mk-text-icon-button'),
      api($textIconButton),
  ),
};

@_p.customElement({
  dependencies: [
    AddProjectDialog,
  ],
  tag: 'th-project-list-sidebar',
  template,
})
export class ProjectListSidebar extends ThemedCustomElementCtrl {
  private readonly onAddProjectAction = _p.input($.addProject._.actionEvent, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.addProject._.disabled).withVine(_v.stream(this.renderAddProjectDisabled, this)),
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

  private setupOnAddProjectAction(vine: Vine): Observable<unknown> {
    return this.onAddProjectAction.pipe(
        switchMap(() => openAddProjectDialog(vine)),
    );
  }
}
