import { instanceSourceId } from 'grapevine/export/component';
import { ElementWithTagType, StringType } from 'gs-types/export';
import { $textIconButton, $textInput, _p, _v, IconWithText, TextIconButton, TextInput, ThemedCustomElementCtrl } from 'mask/export';
import { element } from 'persona/export/input';
import { api } from 'persona/export/main';
import { Observable } from 'rxjs';
import { switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { $projectCollection, ProjectCollection } from '../../datamodel/project-collection';
import { logger } from './logger';
import projectListViewTemplate from './project-list-view.html';

export const DEFAULT_PROJECT_NAME = 'New Project';

export const $ = {
  addButton: element('addButton', ElementWithTagType('mk-text-icon-button'), api($textIconButton)),
  addProjectName: element('addProjectName', ElementWithTagType('mk-text-input'), api($textInput)),
};

const $initProjectName = instanceSourceId('initProjectName', StringType);
_v.builder.source($initProjectName, DEFAULT_PROJECT_NAME);

@_p.customElement({
  dependencies: [
    IconWithText,
    TextInput,
    TextIconButton,
  ],
  tag: 'th-project-list-view',
  template: projectListViewTemplate,
})
@_p.render($.addProjectName._.initValue).withForwarding($initProjectName)
export class ProjectListView extends ThemedCustomElementCtrl {
  @_p.render($.addProjectName._.clearFn)
  onAddButtonClick_(
      @_p.input($.addButton._.actionEvent) actionEventObs: Observable<Event>,
      @_p.input($.addProjectName._.value) projectNameInputValueObs: Observable<string>,
      @_v.vineIn($projectCollection) projectCollectionObs: Observable<ProjectCollection>,
  ): Observable<unknown> {
    return actionEventObs
        .pipe(
            withLatestFrom(projectCollectionObs),
            switchMap(([, projectCollection]) => projectCollection.newProject()),
            withLatestFrom(
                projectCollectionObs,
                projectNameInputValueObs,
            ),
            tap(([newProject, projectCollection, projectNameInputValue]) => {
              logger.info('NEW_PROJECT', projectNameInputValue);
              projectCollection.setProject(newProject.setName(projectNameInputValue));
            }),
        );
  }
}
