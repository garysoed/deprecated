import { assert, runEnvironment, setup, should, test } from '@gs-testing';
import { filterNonNull, scanArray } from '@gs-tools/rxjs';
import { _p, Dialog } from '@mask';
import { DialogTester } from '@mask/testing';
import { PersonaTester, PersonaTesterEnvironment, PersonaTesterFactory } from '@persona/testing';
import { map, switchMap, withLatestFrom } from '@rxjs/operators';
import { $itemCollection } from '../../datamodel/local-folder-collection';
import { $projectCollection } from '../../datamodel/project-collection';
import { $, AddProjectDialog, openDialog } from './add-project-dialog';

const factory = new PersonaTesterFactory(_p);

test('@thoth/view/projectlist/add-project-dialog', () => {
  runEnvironment(new PersonaTesterEnvironment());

  let dialogTester: DialogTester;
  let tester: PersonaTester;

  setup(() => {
    tester = factory.build([AddProjectDialog, Dialog]);
    dialogTester = new DialogTester(tester, document.body);
  });

  test('onClose', () => {
    setup(() => {
      openDialog(tester.vine).subscribe();
    });

    should(`create the new project correctly`, () => {
      const newProjectName = 'newProjectName';
      dialogTester.getContentObs()
          .pipe(
              filterNonNull(),
              switchMap(
                  contentEl => tester
                      .setAttribute(contentEl, $.addProjectName._.value, newProjectName),
              ),
          )
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
              withLatestFrom($itemCollection.get(tester.vine)),
              switchMap(([project, collection]) => collection.get(project.rootFolderId)),
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
          .pipe(
              filterNonNull(),
              switchMap(
                  contentEl => tester
                      .setAttribute(contentEl, $.addProjectName._.value, newProjectName),
              ),
          )
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
