import { assert, setup, should, test } from '@gs-testing';
import { filterNonNull, scanArray } from '@gs-tools/rxjs';
import { _p, Dialog } from '@mask';
import { DialogTester } from '@mask/testing';
import { PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { map, switchMap, withLatestFrom } from '@rxjs/operators';
import { $itemService } from 'src/datamodel/item-service';
import { $projectCollection } from '../../datamodel/project-collection';
import { $, AddProjectDialog, openDialog } from './add-project-dialog';

const factory = new PersonaTesterFactory(_p);

test('@thoth/view/projectlist/add-project-dialog', () => {
  let dialogTester: DialogTester;
  let tester: PersonaTester;

  setup(() => {
    tester = factory.build([AddProjectDialog, Dialog]);
    dialogTester = new DialogTester(tester, document.body, tester.vine);
  });

  test('onClose', () => {
    setup(() => {
      openDialog(tester.vine).subscribe();
    });

    should(`create the new project correctly`, () => {
      const newProjectName = 'newProjectName';
      dialogTester.getContentObs()
          .setAttribute($.addProjectName._.value, newProjectName)
          .subscribe();
      dialogTester.clickOk().subscribe();

      const projectObs = $projectCollection.get(tester.vine)
          .pipe(
              switchMap(collection => {
                return collection.getProjectIds()
                    .pipe(
                        scanArray(),
                        map(projectIds => [...projectIds][0] || null),
                        filterNonNull(),
                        switchMap(projectId => collection.getProject(projectId)),
                    );
              }),
              filterNonNull(),
          );

      assert(projectObs.pipe(map(project => project.name))).to.emitWith(newProjectName);

      const itemObs = projectObs
          .pipe(
              withLatestFrom($itemService.get(tester.vine)),
              switchMap(([project, collection]) => collection.getItem(project.rootFolderId)),
          );
      assert(itemObs.pipe(filterNonNull())).to.emit();
    });

    should(`do nothing if there are no project names`, () => {
      dialogTester.clickOk().subscribe();

      const projectCount = $projectCollection.get(tester.vine)
          .pipe(
              switchMap(collection => collection.getProjectIds()),
              scanArray(),
              map(ids => ids.length),
          );
      assert(projectCount).to.emitWith(0);
    });

    should(`do nothing if dialog is canceled`, () => {
      const newProjectName = 'newProjectName';
      dialogTester.getContentObs()
          .setAttribute($.addProjectName._.value, newProjectName)
          .subscribe();
      dialogTester.clickCancel().subscribe();

      const projectCount = $projectCollection.get(tester.vine)
          .pipe(
              switchMap(collection => collection.getProjectIds()),
              scanArray(),
              map(ids => ids.length),
          );
      assert(projectCount).to.emitWith(0);
    });
  });
});
