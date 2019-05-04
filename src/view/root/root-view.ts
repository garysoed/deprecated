import { Vine } from '@grapevine';
import { ElementWithTagType } from '@gs-types';
import { $dialogService, $textIconButton, _p, _v, Dialog, Drawer, RootLayout, ThemedCustomElementCtrl } from '@mask';
import { api, element, InitFn } from '@persona';
import { Observable } from '@rxjs';
import { map, shareReplay, switchMap, tap, withLatestFrom } from '@rxjs/operators';
import template from './root-view.html';

export const $ = {
  addProject: element(
      'addProject',
      ElementWithTagType('mk-text-icon-button'),
      api($textIconButton),
  ),
};

@_p.customElement({
  dependencies: [Dialog, Drawer, RootLayout],
  tag: 'th-root-view',
  template,
})
export class RootView extends ThemedCustomElementCtrl {
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
    return this.onAddProjectAction
        .pipe(
            withLatestFrom($dialogService.get(vine)),
            tap(([, dialogService]) => {
              dialogService.open({
                cancelable: true,
                content: {tag: 'th-add-project'},
                onClose: () => undefined,
                title: 'Create new project',
              });
            }),
        );
  }
}
