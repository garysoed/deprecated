import { Main } from 'external/gs_ui/src/bootstrap';
import { DefaultPalettes, Theme } from 'external/gs_ui/src/theming';

const theme = Theme.newInstance(
    DefaultPalettes.get('green'),
    DefaultPalettes.get('orangepeel'));

Main.newInstance({}, window['gs'].Templates.newInstance()).bootstrap(theme);
