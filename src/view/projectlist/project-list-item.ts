import { filterNonNull } from '@gs-tools/rxjs';
import { ElementWithTagType } from '@gs-types';
import { $listItem, $textIconButton, _p, _v, ListItem, stringParser, TextIconButton, ThemedCustomElementCtrl } from '@mask';
import { api, attributeIn, element, InitFn, onDom } from '@persona';
import { Observable } from '@rxjs';
import { map, switchMap, tap, withLatestFrom } from '@rxjs/operators';
import { createPath } from '../../datamodel/folder-path';
import { $projectCollection } from '../../datamodel/project-collection';
import { $locationService } from '../../main/route';
import template from './project-list-item.html';

export const $ = {
  delete: element('delete', ElementWithTagType('mk-text-icon-button'), api($textIconButton)),
  host: element({projectId: attributeIn('project-id', stringParser())}),
  item: element('item', ElementWithTagType('mk-list-item'), {
    ...api($listItem),
    onClick: onDom('click'),
  }),
};

@_p.customElement({
  dependencies: [
    ListItem,
    TextIconButton,
  ],
  tag: 'th-project-list-item',
  template,
})
export class ProjectListItem extends ThemedCustomElementCtrl {
  private readonly locationService = $locationService.asObservable();
  private readonly onDeleteAction = _p.input($.delete._.actionEvent, this);
  private readonly onItemClick = _p.input($.item._.onClick, this);
  private readonly projectCollection = $projectCollection.asObservable();
  private readonly projectIdObs = _p.input($.host._.projectId, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.item._.itemName).withVine(_v.stream(this.renderItemName, this)),
      () => this.setupHandleAction(),
      () => this.setupHandleDelete(),
    ];
  }

  private renderItemName(): Observable<string> {
    return this.projectIdObs
        .pipe(
            withLatestFrom(this.projectCollection),
            switchMap(([id, collection]) => collection.getProject(id)),
            map(project => {
              if (!project) {
                return '';
              }

              return project.name;
            }),
        );
  }

  private setupHandleAction(): Observable<unknown> {
    return this.onItemClick
        .pipe(
            withLatestFrom(this.projectIdObs, this.projectCollection),
            switchMap(([, projectId, projectCollection]) => {
              return projectCollection.getProject(projectId);
            }),
            filterNonNull(),
            withLatestFrom(this.locationService),
            tap(([project, locationService]) => {
              locationService.goToPath('PROJECT', {route: createPath([project.rootFolderId])});
            }),
        );
  }

  private setupHandleDelete(): Observable<unknown> {
    return this.onDeleteAction
        .pipe(
            withLatestFrom(
                this.projectIdObs,
                this.projectCollection,
            ),
            switchMap(([, projectId, projectCollection]) => {
              return projectCollection.deleteProject(projectId);
            }),
        );
  }
}
