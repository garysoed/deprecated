import { assert, match, runEnvironment, setup, should, test } from '@gs-testing';
import { _p } from '@mask';
import { PersonaTester, PersonaTesterEnvironment, PersonaTesterFactory } from '@persona/testing';
import {of as observableOf } from '@rxjs';
import { filter, map, switchMap, take, tap, withLatestFrom } from '@rxjs/operators';
import { parseId } from '../../datamodel/item-id';
import { $projectCollection } from '../../datamodel/project-collection';
import { $, ProjectListView } from './project-list-view';


const testerFactory = new PersonaTesterFactory(_p);

test('@thoth/view/projectlist/project-list-view', () => {
  runEnvironment(new PersonaTesterEnvironment());

  let el: HTMLElement;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([ProjectListView]);

    el = tester.createElement('th-project-list-view', document.body);
  });

  test('renderProjectList', () => {
    should(`render the list correctly`, async () => {
      // Create the projects.
      observableOf('1', '2', '3')
          .pipe(
              withLatestFrom($projectCollection.get(tester.vine)),
              switchMap(([id, collection]) => {
                return collection.newProject(parseId('lo_rootFolderId'))
                    .pipe(
                        map(newProject => newProject
                            .$update(newProject.$set.name(`Project ${id}`))),
                        switchMap(newProject => collection.setProject(newProject)),
                    );
              }),
          )
          .subscribe();

      const nodesObs = tester.getNodesAfter(el, $.projectList._.repeated)
          .pipe(
              switchMap(nodes => observableOf(...nodes)),
              filter((node): node is Element => node instanceof Element),
          );

      assert(nodesObs).to.emitSequence([
        match.anyElementThat().haveTag('th-project-list-item'),
        match.anyElementThat().haveTag('th-project-list-item'),
        match.anyElementThat().haveTag('th-project-list-item'),
      ]);

      // Get the projectID attributes
      const projectNameObs = nodesObs
          .pipe(
              take(3),
              map(el => (el as Element).getAttribute('project-id')!),
              withLatestFrom($projectCollection.get(tester.vine)),
              switchMap(([projectId, collection]) => collection.getProject(projectId)),
              map(project => project!.name),
          );
      assert(projectNameObs).to.emitSequence(['Project 1', 'Project 2', 'Project 3']);
    });
  });
});
