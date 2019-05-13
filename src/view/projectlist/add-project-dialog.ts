import { Vine } from '@grapevine';
import { ElementWithTagType } from '@gs-types';
import { $dialogService, $textInput, _p, _v, TextInput, ThemedCustomElementCtrl } from '@mask';
import { api, element, InitFn } from '@persona';
import { BehaviorSubject, combineLatest, EMPTY, Observable } from '@rxjs';
import { map, switchMap, take, tap, withLatestFrom } from '@rxjs/operators';
import { LocalSource } from 'src/datamodel/local-source';
import { SourceType } from 'src/datamodel/source-type';
import { $itemMetadataCollection } from '../../datamodel/item-metadata-collection';
import { $projectCollection } from '../../datamodel/project-collection';
import template from './add-project-dialog.html';
import { logger } from './logger';

interface NewProjectSpec {
  projectName?: string;
}

const $newProjectSpec = _v.source(() => new BehaviorSubject<NewProjectSpec|null>(null), globalThis);

export const $ = {
  addProjectName: element('addProjectName', ElementWithTagType('mk-text-input'), api($textInput)),
};

@_p.customElement({
  dependencies: [TextInput],
  tag: 'th-add-project-dialog',
  template,
})
export class AddProjectDialog extends ThemedCustomElementCtrl {
  private readonly addProjectNameObs = _p.input($.addProjectName._.value, this);
  private readonly newProjectSpecSbj = $newProjectSpec.asSubject();

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      () => this.setupNewProjectName(),
    ];
  }

  private setupNewProjectName(): Observable<unknown> {
    return this.addProjectNameObs
        .pipe(
            withLatestFrom(this.newProjectSpecSbj),
            map(([projectName, projectSpec]) => ({
                ...(projectSpec || {}),
                projectName,
            })),
            tap(spec => this.newProjectSpecSbj.next(spec)),
        );
  }
}

export function openDialog(vine: Vine): Observable<unknown> {
  return $dialogService.get(vine)
      .pipe(
          take(1),
          switchMap(
              service => service.open<NewProjectSpec>({
                cancelable: true,
                content: {tag: 'th-add-project-dialog'},
                onClose,
                source: $newProjectSpec,
                title: 'Create new project',
              }),
          ),
      );
}

function onClose(canceled: boolean, value: NewProjectSpec|null, vine: Vine): Observable<any> {
  if (canceled) {
    return EMPTY;
  }

  if (!value || !value.projectName) {
    // TODO: Error and cancel closing the dialog.
    return EMPTY;
  }

  return combineLatest(
      $projectCollection.get(vine),
      $itemMetadataCollection.get(vine),
  )
  .pipe(
      take(1),
      switchMap(([projectCollection, itemMetadataCollection]) => {
        return itemMetadataCollection.newMetadata(true, new LocalSource({type: SourceType.LOCAL}))
            .pipe(
                switchMap(newMetadata => itemMetadataCollection.setMetadata(newMetadata)),
                switchMap(newMetadata => projectCollection.newProject(newMetadata.id)),
                switchMap(newProject => {
                  logger.info('NEW_PROJECT', value.projectName);

                  return projectCollection.setProject(newProject.setName(value.projectName || ''));
                }),
                take(1),
            );
      }),
  );
}
