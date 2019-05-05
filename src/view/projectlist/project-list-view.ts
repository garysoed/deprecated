import { _p, IconWithText, TextIconButton, TextInput, ThemedCustomElementCtrl } from '@mask';
import { InitFn } from '@persona';
import projectListViewTemplate from './project-list-view.html';

export const $ = {
};

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
  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
    ];
  }
}
