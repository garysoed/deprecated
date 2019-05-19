import { Vine } from '@grapevine';
import { ElementWithTagType } from '@gs-types';
import { $textIconButton, _p, _v, TextIconButton, ThemedCustomElementCtrl } from '@mask';
import { api, element, InitFn } from '@persona';
import { EMPTY, Observable } from '@rxjs';
import { map } from '@rxjs/operators';
import template from './folder-sidebar.html';
import { $selectedFolderMetadata } from './selected-folder';

export const $ = {
  addItem: element('addItem', ElementWithTagType('mk-text-icon-button'), api($textIconButton)),
};

@_p.customElement({
  dependencies: [
    TextIconButton,
  ],
  tag: 'th-folder-sidebar',
  template,
})
export class FolderSidebar extends ThemedCustomElementCtrl {
  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.addItem._.disabled).withVine(_v.stream(this.renderAddItemDisabled, this)),
      () => this.setupAddItemClick(),
    ];
  }

  private renderAddItemDisabled(vine: Vine): Observable<boolean> {
    return $selectedFolderMetadata.get(vine)
        .pipe(map(metadata => !metadata || !metadata.isEditable));
  }

  private setupAddItemClick(): Observable<unknown> {
    return EMPTY;
  }
}
