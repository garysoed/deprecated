import { assert, should, test } from 'gs-testing/export/main';
import { $head, $pipe } from 'gs-tools/export/collect';
import { filterNonNull } from 'gs-tools/export/rxjs';
import { _p, _v } from 'mask/export';
import { PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { map, switchMap, take } from 'rxjs/operators';
import { $projectCollection } from '../../datamodel/project-collection';
import { $, DEFAULT_PROJECT_NAME, ProjectListView } from './project-list-view';

const testerFactory = new PersonaTesterFactory(_v.builder, _p.builder);

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
      const projectNameObs = tester.vine.getObservable($projectCollection)
          .pipe(
              switchMap(collection => {
                return collection.getProjectIds()
                    .pipe(
                        map(projectIds => $pipe(projectIds, $head()) || null),
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
