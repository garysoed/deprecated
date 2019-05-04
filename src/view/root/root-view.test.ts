import { assert, setup, should, test } from '@gs-testing';
import { $dialogService, _p, ActionEvent } from '@mask';
import { PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { map, switchMap, tap } from '@rxjs/operators';
import { $, RootView } from './root-view';

const testerFactory = new PersonaTesterFactory(_p);

test('@thoth/view/root/root-view', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([RootView]);
    el = tester.createElement('th-root-view', document.body);
  });

  test('renderAddProjectDisabled', () => {
    should(`disable if the dialog is open`, async () => {
      $dialogService.get(tester.vine)
          .pipe(
              tap(service => service.open({
                cancelable: false,
                content: {tag: 'div'},
                onClose: () => undefined,
                title: 'test',
              })),
          )
          .subscribe();
      await assert(tester.hasAttribute(el, $.addProject._.disabled)).to.emitWith(true);
    });

    should(`not disable if the dialog is closed`, async () => {
      await assert(tester.hasAttribute(el, $.addProject._.disabled)).to.emitWith(false);
    });
  });

  test('setupOnAddProjectAction', () => {
    should(`open the dialog correctly`, async () => {
      tester.dispatchEvent(el, $.addProject._.actionEvent, new ActionEvent()).subscribe();

      const isOpenObs = $dialogService.get(tester.vine)
          .pipe(
              switchMap(service => service.getStateObs()),
              map(state => state.isOpen),
          );
      await assert(isOpenObs).to.emitWith(true);
    });
  });
});
