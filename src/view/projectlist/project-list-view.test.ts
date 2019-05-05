import { test } from '@gs-testing';
import { _p } from '@mask';
import { PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { ProjectListView } from './project-list-view';

const testerFactory = new PersonaTesterFactory(_p);

test('view.ProjectListView', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  beforeEach(() => {
    tester = testerFactory.build([ProjectListView]);

    el = tester.createElement('th-project-list-view', document.body);
  });
});
