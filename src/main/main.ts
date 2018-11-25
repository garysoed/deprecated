import { Palette, start, Theme } from 'mask/export';

window.addEventListener('load', () => {
  const theme = new Theme(Palette.PURPLE, Palette.YELLOW);
  start([], theme, document.getElementById('globalStyle') as HTMLStyleElement);
});
