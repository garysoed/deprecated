import { ElementWithTagType } from '@gs-types';
import { $textIconButton, $textInput, _p, _v, IconWithText, TextIconButton, TextInput, ThemedCustomElementCtrl } from '@mask';
import { InitFn } from '@persona';
import { element } from '@persona/input';
import { api } from '@persona/main';
import { Vine } from 'mask/node_modules/grapevine/export';
import { BehaviorSubject, Observable } from 'rxjs';
import { mapTo, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { $projectCollection } from '../../datamodel/project-collection';
import { logger } from './logger';
import projectListViewTemplate from './project-list-view.html';

export const DEFAULT_PROJECT_NAME = 'New Project';

export const $ = {
  addButton: element('addButton', ElementWithTagType('mk-text-icon-button'), api($textIconButton)),
  addProjectName: element('addProjectName', ElementWithTagType('mk-text-input'), api($textInput)),
};

const $initProjectName = _v.source(() => new BehaviorSubject(DEFAULT_PROJECT_NAME), globalThis);

@_p.customElement({
  dependencies: [
    IconWithText,
    TextInput,
    TextIconButton,
  ],
  tag: 'th-project-list-view',
  template: projectListViewTemplate,
})
export class ProjectListView extends ThemedCustomElementCtrl {
  private readonly actionEventObs = _p.input($.addButton._.actionEvent, this);
  private readonly projectNameInputValueObs = _p.input($.addProjectName._.value, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.addProjectName._.initValue).withVine($initProjectName),
      _p.render($.addProjectName._.clearFn).withVine(_v.stream(this.onAddButtonClick, this)),
    ];
  }

  onAddButtonClick(vine: Vine): Observable<[]> {
    return this.actionEventObs
        .pipe(
            withLatestFrom($projectCollection.get(vine)),
            switchMap(([, projectCollection]) => {
              return projectCollection.newProject()
                  .pipe(
                      take(1),
                      withLatestFrom(this.projectNameInputValueObs),
                      switchMap(([newProject, projectNameInputValue]) => {
                        logger.info('NEW_PROJECT', projectNameInputValue);

                        return projectCollection
                            .setProject(newProject.setName(projectNameInputValue));
                      }),
                  );
            }),
            mapTo([]),
        );
  }
}
