import { Palette, start, Theme } from 'mask/export';
import { rootViewConfig } from '../view/root/root-view';

window.addEventListener('load', () => {
  const theme = new Theme(Palette.PURPLE, Palette.YELLOW);
  start([rootViewConfig()], theme, document.getElementById('globalStyle') as HTMLStyleElement);
});
