import { Vine } from '@grapevine';
import { ElementWithTagType } from '@gs-types';
import { $textIconButton, _p, _v, TextIconButton, ThemedCustomElementCtrl } from '@mask';
import { api, element, InitFn } from '@persona';
import { Observable } from '@rxjs';
import { map, switchMap } from '@rxjs/operators';
import { AddItemDialog, openDialog as openAddItemDialog } from './add-item-dialog';
import template from './folder-sidebar.html';
import { $selectedFolderMetadata } from './selected-folder';

export const $ = {
  addItem: element('addItem', ElementWithTagType('mk-text-icon-button'), api($textIconButton)),
};

@_p.customElement({
  dependencies: [
    AddItemDialog,
    TextIconButton,
  ],
  tag: 'th-folder-sidebar',
  template,
})
export class FolderSidebar extends ThemedCustomElementCtrl {
  private readonly onAddItemClick = _p.input($.addItem._.actionEvent, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.addItem._.disabled).withVine(_v.stream(this.renderAddItemDisabled, this)),
      vine => this.setupAddItemClick(vine),
    ];
  }

  private renderAddItemDisabled(vine: Vine): Observable<boolean> {
    return $selectedFolderMetadata.get(vine)
        .pipe(map(metadata => !metadata || !metadata.isEditable));
  }

  private setupAddItemClick(vine: Vine): Observable<unknown> {
    return this.onAddItemClick.pipe(switchMap(() => openAddItemDialog(vine)));
  }
}