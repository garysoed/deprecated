import { assert, setup, should, test } from '@gs-testing';
import { $window, _p } from '@mask';
import { createFakeWindow, ElementTester, PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { ReplaySubject } from '@rxjs';
import { mapTo, switchMap, take, withLatestFrom } from '@rxjs/operators';
import { Project } from '../../datamodel/project';
import { $projectCollection } from '../../datamodel/project-collection';
import { LocalItemId, parseId, toItemString } from '../../serializable/item-id';
import { $, ProjectListItem } from './project-list-item';

const factory = new PersonaTesterFactory(_p);
test('@thoth/view/projectlist/project-list-item', () => {
  const ROOT_FOLDER_ID = parseId('lo_rootFolderId') as LocalItemId;

  let projectSubject: ReplaySubject<Project>;
  let fakeWindow: Window;
  let el: ElementTester;
  let tester: PersonaTester;

  setup(() => {
    tester = factory.build([ProjectListItem]);
    fakeWindow = createFakeWindow();
    $window.get(tester.vine).next(fakeWindow);

    el = tester.createElement('th-project-list-item', document.body);

    projectSubject = new ReplaySubject(1);
    // Create the new project and sets its ID as the project-id attribute.
    $projectCollection.get(tester.vine)
        .pipe(
            take(1),
            switchMap(collection => collection.newProject(ROOT_FOLDER_ID)
                .pipe(switchMap(newProject => collection.setProject(newProject)),
                ),
            ),
            switchMap(newProject => el.setAttribute($.host._.projectId, newProject.id)
                .pipe(mapTo(newProject)),
            ),
        )
        .subscribe(projectSubject);
  });

  test('renderItemName', () => {
    should(`render the project name correctly`, () => {
      const projectName = 'projectName';
      $projectCollection.get(tester.vine)
          .pipe(
              take(1),
              withLatestFrom(projectSubject),
              switchMap(([collection, project]) => collection
                  .setProject(project.$update(project.$set.name(projectName))),
              ),
          )
          .subscribe();

      assert(el.getAttribute($.item._.itemName)).to.emitWith(projectName);
    });

    should(`render '' if the project cannot be found`, () => {
      el.setAttribute($.host._.projectId, 'nonExistentId').subscribe();

      assert(el.getAttribute($.item._.itemName)).to.emitWith('');
    });
  });

  test('setupHandleAction', () => {
    should(`go to the correct view`, () => {
      el.dispatchEvent($.item._.onClick).subscribe();

      assert(fakeWindow.location.pathname).to.equal(`/p/${toItemString(ROOT_FOLDER_ID)}`);
    });
  });

  test('setupHandleDelete', () => {
    should(`delete the project correctly`, () => {
      const projectCollectionObs = $projectCollection.get(tester.vine);

      // Click the delete button.
      el.dispatchEvent($.delete._.actionEvent).subscribe();

      const projectObs = projectSubject
          .pipe(
              take(1),
              withLatestFrom(projectCollectionObs),
              switchMap(([project, projectCollection]) => {
                return projectCollection.getProject(project.id);
              }),
          );

      assert(projectObs).to.emitWith(null);
    });
  });
});
