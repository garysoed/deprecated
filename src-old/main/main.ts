import { Jsons } from 'external/gs_tools/src/data';
import { Templates } from 'external/gs_tools/src/webc';

import { Main } from 'external/gs_ui/src/bootstrap';
import { DefaultPalettes, Theme } from 'external/gs_ui/src/theming';

import { RootView } from '../main/root-view';

const theme = Theme.newInstance(
    DefaultPalettes.get('green'),
    DefaultPalettes.get('orangepeel'));
window.addEventListener('load', () => {
  Main.newInstance().bootstrap(theme, [RootView]);
});

Jsons.setValue(window, 'gs.Templates', Templates);
