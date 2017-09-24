import { inject } from 'external/gs_tools/src/inject';
import { customElement } from 'external/gs_tools/src/webc';

import { BaseThemedElement2 } from 'external/gs_ui/src/common';
import { ThemeService } from 'external/gs_ui/src/theming';

@customElement({
  tag: 'th-root-view',
  templateKey: 'src/main/root-view',
})
export class RootView extends BaseThemedElement2 {
  constructor(@inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
  }
}
