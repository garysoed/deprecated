import { Palette, start, Theme } from 'mask/export';
import { projectListView } from '../view/projectlist/project-list-view';
import { rootView } from '../view/root/root-view';

window.addEventListener('load', () => {
  const theme = new Theme(Palette.PURPLE, Palette.YELLOW);
  start(
      [
        rootView(),
        projectListView(),
      ],
      theme,
      document.getElementById('globalStyle') as HTMLStyleElement);
});
