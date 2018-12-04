import { Palette, start, Theme } from 'mask/export';
import { folderViewConfig } from '../view/folder/folder-view';

window.addEventListener('load', () => {
  const theme = new Theme(Palette.PURPLE, Palette.YELLOW);
  start([folderViewConfig()], theme, document.getElementById('globalStyle') as HTMLStyleElement);
});
