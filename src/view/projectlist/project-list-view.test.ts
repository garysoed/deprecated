import { assert, match, runEnvironment, setup, should, test } from '@gs-testing';
import { _p } from '@mask';
import { PersonaTester, PersonaTesterEnvironment, PersonaTesterFactory } from '@persona/testing';
import {of as observableOf } from '@rxjs';
import { map, switchMap, take, tap, withLatestFrom } from '@rxjs/operators';
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
                return collection.newProject()
                    .pipe(
                        map(newProject => newProject.setName(`Project ${id}`)),
                        switchMap(newProject => collection.setProject(newProject)),
                    );
              }),
          )
          .subscribe();

      const nodes = await tester
          .getNodesAfter(el, $.projectList._.repeated).pipe(take(1))
          .toPromise();

      assert(nodes).to.startWith([
        match.anyThat<Node>().beAnInstanceOf(Element),
        match.anyThat<Node>().beAnInstanceOf(Element),
        match.anyThat<Node>().beAnInstanceOf(Element),
      ]);
      assert(nodes as Element[]).to.startWith([
        match.anyElementThat().haveTag('th-project-list-item'),
        match.anyElementThat().haveTag('th-project-list-item'),
        match.anyElementThat().haveTag('th-project-list-item'),
      ]);

      // Get the projectID attributes
      const projectNameObs = observableOf(...(nodes as Element[]))
          .pipe(
              take(3),
              map(el => el.getAttribute('project-id')!),
              withLatestFrom($projectCollection.get(tester.vine)),
              switchMap(([projectId, collection]) => collection.getProject(projectId)),
              map(project => project!.name),
          );
      await assert(projectNameObs).to.emitSequence(['Project 1', 'Project 2', 'Project 3']);
    });
  });
});
