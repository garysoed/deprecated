// import { createSpyInstance, fake, setup, should, SpyObj, test } from '@gs-testing';
// import { GapiHandler } from '@gs-tools/gapi';
// import { filterNonNull } from '@gs-tools/rxjs';
// import { _p } from '@mask';
// import { DialogTester } from '@mask/testing';
// import { PersonaTester, PersonaTesterFactory } from '@persona/testing';
// import { of as observableOf } from '@rxjs';
// import { switchMap } from '@rxjs/operators';
// import { $gapiClient, $gapiUrl } from '../../api/gapi-client';
// import { $, AddItemDialog, openDialog } from './add-item-dialog';

// test('@thoth/view/folder/add-item-dialog', () => {
//   const factory = new PersonaTesterFactory(_p);

//   let mockGapiHandler: SpyObj<GapiHandler>;
//   let tester: PersonaTester;
//   let dialogTester: DialogTester;

//   setup(() => {
//     mockGapiHandler = createSpyInstance(GapiHandler);
//     fake(mockGapiHandler.ensureSignedIn).always().return(observableOf(true));

//     tester = factory.build([AddItemDialog]);
//     dialogTester = new DialogTester(tester, document.body);
//     $gapiUrl.get(tester.vine).next('');
//     $gapiClient.get(tester.vine).next(mockGapiHandler);

//     openDialog(tester.vine).subscribe();
//   });

//   test('renderSearchResults', () => {
//     should.only(`render the files correctly`, async () => {
//       const query = 'query';

//       dialogTester.getContentObs()
//           .pipe(
//               filterNonNull(),
//               switchMap(el => tester.setAttribute(el, $.search._.value, query)),
//           )
//           .subscribe();
//     });
//   });

//   test('setupUpdateResults', () => {
//     should.only(`perform the search correctly`);
//   });
// });
