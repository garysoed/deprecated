import { assert, setup, should, test } from '@gs-testing';
import { _p } from '@mask';
import { PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { mapTo, switchMap, take } from '@rxjs/operators';
import { $projectCollection } from '../../datamodel/project-collection';
import { $, ProjectListItem } from './project-list-item';

const factory = new PersonaTesterFactory(_p);
test('@thoth/view/projectlist/project-list-item', () => {
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
                      switchMap(newProject => collection
                          .setProject(newProject.setName(projectName))
                          .pipe(
                              switchMap(() => tester
                                  .setAttribute(el, $.host._.projectId, newProject.id),
                              ),
                          ),
                      ),
                  ),
              ),
          )
          .subscribe();

      await assert(tester.getAttribute(el, $.item._.itemName)).to.emitWith(projectName);
    });

    should(`render '' if the project cannot be found`, async () => {
      tester.setAttribute(el, $.host._.projectId, 'nonExistentId');

      await assert(tester.getAttribute(el, $.item._.itemName)).to.emitWith('');
    });
  });
});
