import { assert, setup, should, test } from '@gs-testing';
import { $dialogService, _p, ActionEvent } from '@mask';
import { ElementTester, PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { map, switchMap } from '@rxjs/operators';
import { $, ProjectListSidebar } from './project-list-sidebar';

const testerFactory = new PersonaTesterFactory(_p);

test('@thoth/view/projectlist/project-list-sidebar', () => {
  let el: ElementTester;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([ProjectListSidebar]);
    el = tester.createElement('th-project-list-sidebar', document.body);
  });

  test('renderAddProjectDisabled', () => {
    should(`disable if the dialog is open`, () => {
      $dialogService.get(tester.vine)
          .pipe(
              switchMap(service => service.open({
                cancelable: false,
                content: {tag: 'div'},
                title: 'test',
              })),
          )
          .subscribe();
      assert(el.hasAttribute($.addProject._.disabled)).to.emitWith(true);
    });

    should(`not disable if the dialog is closed`, () => {
      assert(el.hasAttribute($.addProject._.disabled)).to.emitWith(false);
    });
  });

  test('setupOnAddProjectAction', () => {
    should(`open the dialog correctly`, () => {
      el.dispatchEvent($.addProject._.actionEvent, new ActionEvent()).subscribe();

      const isOpenObs = $dialogService.get(tester.vine)
          .pipe(
              switchMap(service => service.getStateObs()),
              map(state => state.isOpen),
          );
      assert(isOpenObs).to.emitWith(true);
    });
  });
});
