import { createImmutableList, ImmutableList } from '@gs-tools/collect';
import { filterNonNull } from '@gs-tools/rxjs';
import { ElementWithTagType } from '@gs-types';
import { $breadcrumb, _p, _v, Breadcrumb, CrumbData, ThemedCustomElementCtrl } from '@mask';
import { api, element, InitFn } from '@persona';
import { combineLatest, merge, Observable } from '@rxjs';
import { map, switchMap, take, withLatestFrom } from '@rxjs/operators';
import { getFolderIds } from '../../datamodel/folder-path';
import { $itemMetadataCollection } from '../../datamodel/item-metadata-collection';
import { $locationService } from '../../main/route';
import template from './folder-view.html';

export const $ = {
  breadcrumb: element('breadcrumb', ElementWithTagType('mk-breadcrumb'), api($breadcrumb)),
};

@_p.customElement({
  dependencies: [
    Breadcrumb,
  ],
  tag: 'th-folder-view',
  template,
})
export class FolderView extends ThemedCustomElementCtrl {
  private readonly itemMetadataCollection = $itemMetadataCollection.asObservable();
  private readonly locationService = $locationService.asObservable();

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.breadcrumb._.path).withVine(_v.stream(this.renderBreadcrumbPath, this)),
    ];
  }

  private renderBreadcrumbPath(): Observable<ImmutableList<CrumbData>> {
    const projectRouteObs = this.locationService
        .pipe(
            switchMap(service => service.getLocationOfType('PROJECT')),
            filterNonNull(),
        );

    return merge(
        combineLatest(projectRouteObs, this.itemMetadataCollection).pipe(take(1)),
        projectRouteObs.pipe(withLatestFrom(this.itemMetadataCollection)),
    )
        .pipe(
            switchMap(([{payload}, itemMetadataCollection]) => {
              const folderCrumbDataObs = getFolderIds(payload.route)
                  .map(id => {
                    return itemMetadataCollection.getMetadata(id)
                        .pipe(
                            map(metadata => metadata ? metadata.name : ''),
                            map(display => ({display, key: id.toString()})),
                        );
                  });

              return combineLatest(...folderCrumbDataObs);
            }),
            map(crumbData => createImmutableList(crumbData)),
        );
  }
}
