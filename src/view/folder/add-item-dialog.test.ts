import { assert, match, setup, should, test } from '@gs-testing';
import { filterNonNull } from '@gs-tools/rxjs';
import { _p } from '@mask';
import { DialogTester } from '@mask/testing';
import { PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { map, switchMap } from '@rxjs/operators';
import { ItemType } from 'src/datamodel/item-type';
import { FakeGapiClient, installFakeGapiClient } from '../../testing/fake-gapi';
import { $, AddItemDialog, openDialog } from './add-item-dialog';

test('@thoth/view/folder/add-item-dialog', () => {
  const factory = new PersonaTesterFactory(_p);

  let fakeGapi: FakeGapiClient;
  let tester: PersonaTester;
  let dialogTester: DialogTester;

  setup(() => {
    tester = factory.build([AddItemDialog]);
    dialogTester = new DialogTester(tester, document.body);
    fakeGapi = installFakeGapiClient(tester.vine);

    openDialog(tester.vine).subscribe();
  });

  test('renderSearchResults', () => {
    should(`render the files correctly`, async () => {
      const query = 'query';
      const id1 = 'id1';
      const id2 = 'id2';
      const id3 = 'id3';
      const name1 = 'name1';
      const name2 = 'name2';
      const name3 = 'name3';

      dialogTester.getContentObs()
          .pipe(
              filterNonNull(),
              switchMap(el => tester.setAttribute(el, $.search._.value, query)),
          )
          .subscribe();
      fakeGapi.drive.files.listSubject.next({
        result: {
          files: [
            {id: id1, mimeType: 'application/x-javascript', name: name1},
            {id: id2, mimeType: 'application/vnd.google-apps.folder', name: name2},
            {id: id3, mimeType: 'text/plain', name: name3},
          ],
        },
      });

      const nodesObs = dialogTester.getContentObs()
          .pipe(
              filterNonNull(),
              switchMap(el => tester.getNodesAfter(el, $.results._.list)),
              map(nodes => nodes
                  .filter((node): node is HTMLElement => node instanceof HTMLElement),
              ),
          );

      await assert(nodesObs.pipe(map(nodes => nodes.length))).to.emitWith(3);

      const labelsObs = nodesObs.pipe(map(nodes => nodes.map(node => node.getAttribute('label'))));
      await assert(labelsObs).to
          .emitWith(match.anyArrayThat<string>().haveExactElements([name1, name2, name3]));

      const idsObs = nodesObs.pipe(map(nodes => nodes.map(node => node.getAttribute('item-id'))));
      await assert(idsObs).to.emitWith(match.anyArrayThat<string>().haveExactElements([
        `dr_${id1}`,
        `dr_${id2}`,
        `dr_${id3}`,
      ]));

      const typesObs = nodesObs
          .pipe(map(nodes => nodes.map(node => node.getAttribute('item-type'))));
      await assert(typesObs).to.emitWith(match.anyArrayThat<string>().haveExactElements([
        ItemType.CONVERTER,
        ItemType.FOLDER,
        ItemType.UNKNOWN,
      ]));
    });
  });

  test('setupUpdateResults', () => {
    should(`perform the search correctly`, async () => {
      const query = 'query';
      const id = 'id';
      const name = 'name';

      dialogTester.getContentObs()
          .pipe(
              filterNonNull(),
              switchMap(el => tester.setAttribute(el, $.search._.value, query)),
          )
          .subscribe();
      fakeGapi.drive.files.listSubject.next({
        result: {
          files: [{id, name}],
        },
      });

      const nodesObs = dialogTester.getContentObs()
          .pipe(
              filterNonNull(),
              switchMap(el => tester.getNodesAfter(el, $.results._.list)),
              map(nodes => nodes
                  .filter((node): node is HTMLElement => node instanceof HTMLElement),
              ),
          );

      const idsObs = nodesObs.pipe(map(nodes => nodes.map(node => node.getAttribute('item-id'))));
      await assert(idsObs).to.emitWith(match.anyArrayThat<string>()
          .haveExactElements([`dr_${id}`]));

      assert(fakeGapi.drive.files.list).to.haveBeenCalledWith(match.anyObjectThat().haveProperties({
        q: `name contains '${query}'`,
      }));
    });
  });
});
