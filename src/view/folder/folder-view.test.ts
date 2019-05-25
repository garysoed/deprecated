import { assert, match, runEnvironment, setup, should, test } from '@gs-testing';
import { $window, _p, CrumbData } from '@mask';
import { createFakeWindow, PersonaTester, PersonaTesterEnvironment, PersonaTesterFactory } from '@persona/testing';
import { BehaviorSubject, of as observableOf } from '@rxjs';
import { map, scan, switchMap, withLatestFrom } from '@rxjs/operators';
import { createPath } from '../../datamodel/folder-path';
import { Item } from '../../datamodel/item';
import { $itemMetadataCollection } from '../../datamodel/item-collection';
import { $, FolderView } from './folder-view';

const factory = new PersonaTesterFactory(_p);
test('@thoth/view/folder/folder-view', () => {
  runEnvironment(new PersonaTesterEnvironment());

  let fakeWindow: Window;
  let tester: PersonaTester;
  let el: HTMLElement;

  setup(() => {
    fakeWindow = createFakeWindow();
    tester = factory.build([FolderView]);
    $window.get(tester.vine).next(fakeWindow);

    el = tester.createElement('th-folder-view', document.body);
  });

  test('renderBreadcrumbPath', () => {
    should(`render the crumbs correctly`, async () => {
      const display1 = 'display1';
      const display2 = 'display2';
      const display3 = 'display3';

      const newMetadataSubject = new BehaviorSubject([] as Item[]);

      observableOf(display1, display2, display3)
          .pipe(
              withLatestFrom($itemMetadataCollection.get(tester.vine)),
              switchMap(([display, collection]) => {
                return collection.newLocalFolderMetadata()
                    .pipe(
                        switchMap(metadata => collection.setMetadata(metadata.setName(display))),
                    );
              }),
              scan((acc: Item[], value: Item) => [...acc, value], []),
          )
          .subscribe(newMetadataSubject);

      const newMetadata = newMetadataSubject.getValue();
      const ids = newMetadata.map(({id}) => id);
      fakeWindow.history.pushState({}, '', `/p/${createPath(ids)}`);
      fakeWindow.dispatchEvent(new CustomEvent('popstate'));

      const crumbDataMatches = newMetadata
          .map(({id, name}) => match.anyObjectThat<CrumbData>().haveProperties({
            display: name,
            key: id.toString(),
          }));

      await assert(tester.getAttribute(el, $.breadcrumb._.path).pipe(map(list => [...list])))
          .to.emitWith(match.anyArrayThat<CrumbData>().haveExactElements(crumbDataMatches));
    });
  });
});
