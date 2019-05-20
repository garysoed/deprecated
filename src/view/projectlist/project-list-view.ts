import { Vine } from '@grapevine';
import { ArrayDiff, mapArray } from '@gs-tools/rxjs';
import { ElementWithTagType } from '@gs-types';
import { _p, _v, ThemedCustomElementCtrl } from '@mask';
import { element, InitFn, repeated, RepeatedSpec } from '@persona';
import { Observable } from '@rxjs';
import { switchMap } from '@rxjs/operators';
import { $projectCollection } from '../../datamodel/project-collection';
import { ProjectListItem } from './project-list-item';
import template from './project-list-view.html';

export const $ = {
  projectList: element('projectList', ElementWithTagType('section'), {
    repeated: repeated('#projectList', 'th-project-list-item'),
  }),
};

@_p.customElement({
  dependencies: [
    ProjectListItem,
  ],
  tag: 'th-project-list-view',
  template,
})
export class ProjectListView extends ThemedCustomElementCtrl {
  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.projectList._.repeated).withVine(_v.stream(this.renderProjectList, this)),
    ];
  }

  private renderProjectList(vine: Vine): Observable<ArrayDiff<RepeatedSpec>> {
    return $projectCollection.get(vine)
        .pipe(
            switchMap(collection => collection.getProjectIds()),
            mapArray(id => ({attr: new Map([['project-id', id]])})),
        );
  }
}
