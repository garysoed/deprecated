import { Jsons } from 'external/gs_tools/src/data';
import { Templates } from 'external/gs_tools/src/webc';

import { Main } from 'external/gs_ui/src/bootstrap';
import { DefaultPalettes, Theme } from 'external/gs_ui/src/theming';

import { RootView } from '../main/root-view';
import { RouteFactoryService } from '../route/route-factory-service';

const theme = Theme.newInstance(
    DefaultPalettes.get('green'),
    DefaultPalettes.get('orangepeel'));
window.addEventListener('load', () => {
  Main.newInstance({routeFactoryServiceCtor: RouteFactoryService}).bootstrap(theme, [RootView]);
});

Jsons.setValue(window, 'gs.Templates', Templates);
