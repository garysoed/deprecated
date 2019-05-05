import { Vine } from '@grapevine';
import { ElementWithTagType } from '@gs-types';
import { $listItem, _p, _v, ListItem, stringParser, ThemedCustomElementCtrl } from '@mask';
import { api, attributeIn, element, InitFn } from '@persona';
import { Observable } from '@rxjs';
import { map, switchMap, withLatestFrom } from '@rxjs/operators';
import { $projectCollection } from '../../datamodel/project-collection';
import template from './project-list-item.html';

export const $ = {
  host: element({projectId: attributeIn('project-id', stringParser())}),
  item: element('item', ElementWithTagType('mk-list-item'), api($listItem)),
};

@_p.customElement({
  dependencies: [
    ListItem,
  ],
  tag: 'th-project-list-item',
  template,
})
export class ProjectListItem extends ThemedCustomElementCtrl {
  private readonly projectIdObs = _p.input($.host._.projectId, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.item._.itemName).withVine(_v.stream(this.renderItemName, this)),
    ];
  }

  private renderItemName(vine: Vine): Observable<string> {
    return this.projectIdObs
        .pipe(
            withLatestFrom($projectCollection.get(vine)),
            switchMap(([id, collection]) => collection.getProject(id)),
            map(project => {
              if (!project) {
                return '';
              }

              return project.name;
            }),
        );
  }
}
