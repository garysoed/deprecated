import { instanceSourceId } from 'grapevine/export/component';
import { ElementWithTagType, StringType } from 'gs-types/export';
import { _p, _v, IconWithText, TextIconButton, TextInput, ThemedCustomElementCtrl } from 'mask/export';
import { identity } from 'nabu/export/util';
import { attributeIn, channelOut, element, onDom } from 'persona/export/input';
import { attributeOut } from 'persona/export/output';
import { Observable } from 'rxjs';
import { switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { $projectCollection, ProjectCollection } from '../../datamodel/project-collection';
import projectListViewTemplate from './project-list-view.html';

export const DEFAULT_PROJECT_NAME = 'New Project';

export const $ = {
  addButton: element('addButton', ElementWithTagType('mk-text-icon-button'), {
    onClick: onDom('click'),
  }),
  addProjectName: element('addProjectName', ElementWithTagType('mk-text-input'), {
    clearFn: channelOut<void>('mkClear'),
    initValue: attributeOut('init-value', identity()),
    value: attributeIn('value', identity(), StringType),
  }),
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
  @_p.onCreate()
  onAddButtonClick_(
      @_p.input($.addProjectName._.clearFn) clearFnObs: Observable<() => void>,
      @_p.input($.addButton._.onClick) clickEventObs: Observable<Event>,
      @_p.input($.addProjectName._.value) projectNameInputValueObs: Observable<string>,
      @_v.vineIn($projectCollection) projectCollectionObs: Observable<ProjectCollection>,
  ): Observable<unknown> {
    return clickEventObs
        .pipe(
            withLatestFrom(projectCollectionObs),
            switchMap(([, projectCollection]) => projectCollection.newProject()),
            take(1),
            withLatestFrom(
                projectCollectionObs,
                projectNameInputValueObs,
                clearFnObs,
            ),
            tap(([newProject, projectCollection, projectNameInputValue, clearFn]) => {
              projectCollection.setProject(newProject.setName(projectNameInputValue));
              clearFn();
            }),
        );
  }
}