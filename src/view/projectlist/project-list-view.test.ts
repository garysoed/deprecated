import { assert, should, test } from '@gs-testing';
import { filterNonNull, scanSet } from '@gs-tools/rxjs';
import { _p, _v } from '@mask';
import { PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { map, switchMap, take } from '@rxjs/operators';
import { $projectCollection } from '../../datamodel/project-collection';
import { $, DEFAULT_PROJECT_NAME, ProjectListView } from './project-list-view';

const testerFactory = new PersonaTesterFactory(_p);

test('view.ProjectListView', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  beforeEach(() => {
    tester = testerFactory.build([ProjectListView]);

    el = tester.createElement('th-project-list-view', document.body);
  });

  test('onAddButtonClick', () => {
    should(`add the new project correctly`, async () => {
      const newProjectName = 'newProjectName';
      tester.setAttribute(el, $.addProjectName._.value, newProjectName).subscribe();

      const addButtonEl = await tester.getElement(el, $.addButton).pipe(take(1)).toPromise();
      addButtonEl.click();

      await assert(tester.getAttribute(el, $.addProjectName._.value))
          .to.emitWith(DEFAULT_PROJECT_NAME);
      const projectNameObs = $projectCollection.get(tester.vine)
          .pipe(
              switchMap(collection => {
                return collection.getProjectIds()
                    .pipe(
                        scanSet(),
                        map(projectIds => [...projectIds][0] || null),
                        filterNonNull(),
                        switchMap(projectId => collection.getProject(projectId)),
                    );
              }),
              filterNonNull(),
              map(project => project.name),
          );
      await assert(projectNameObs).to.emitWith(newProjectName);
    });
  });
});
