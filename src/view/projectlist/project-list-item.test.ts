import { assert, runEnvironment, setup, should, test } from '@gs-testing';
import { _p } from '@mask';
import { PersonaTester, PersonaTesterEnvironment, PersonaTesterFactory } from '@persona/testing';
import { shareReplay, switchMap, take, withLatestFrom } from '@rxjs/operators';
import { $projectCollection } from '../../datamodel/project-collection';
import { $, ProjectListItem } from './project-list-item';

const factory = new PersonaTesterFactory(_p);
test('@thoth/view/projectlist/project-list-item', () => {
  runEnvironment(new PersonaTesterEnvironment());

  let el: HTMLElement;
  let tester: PersonaTester;

  setup(() => {
    tester = factory.build([ProjectListItem]);
    el = tester.createElement('th-project-list-item', document.body);
  });

  test('renderItemName', () => {
    should(`render the project name correctly`, async () => {
      const projectName = 'projectName';
      // Create the new project and sets its ID as the project-id attribute.
      $projectCollection.get(tester.vine)
          .pipe(
              take(1),
              switchMap(collection => collection
                  .newProject()
                  .pipe(
                      switchMap(newProject =>
                          collection.setProject(newProject.setName(projectName)),
                      ),
                  ),
              ),
              switchMap(newProject => tester.setAttribute(el, $.host._.projectId, newProject.id)),
          )
          .subscribe();

      await assert(tester.getAttribute(el, $.item._.itemName)).to.emitWith(projectName);
    });

    should(`render '' if the project cannot be found`, async () => {
      tester.setAttribute(el, $.host._.projectId, 'nonExistentId');

      await assert(tester.getAttribute(el, $.item._.itemName)).to.emitWith('');
    });
  });

  test('setupHandleDelete', () => {
    should.only(`delete the project correctly`, async () => {
      const projectCollectionObs = $projectCollection.get(tester.vine);
      // Create the new project and sets its ID as the project-id attribute.
      const projectIdObs = projectCollectionObs
          .pipe(
              take(1),
              switchMap(collection => collection
                  .newProject()
                  .pipe(switchMap(newProject => collection.setProject(newProject))),
              ),
              shareReplay(1),
          );
      projectIdObs
          .pipe(switchMap(project => tester.setAttribute(el, $.host._.projectId, project.id)))
          .subscribe();

      // Click the delete button.
      tester.dispatchEvent(el, $.delete._.actionEvent).subscribe();

      const projectObs = projectIdObs
          .pipe(
              take(1),
              withLatestFrom(projectCollectionObs),
              switchMap(([project, projectCollection]) => {
                return projectCollection.getProject(project.id);
              }),
          );

      await assert(projectObs).to.emitWith(null);
    });
  });
});
