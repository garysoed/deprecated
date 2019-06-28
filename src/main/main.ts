import { $svgConfig, Palette, start, SvgConfig, Theme } from '@mask';
import { ConsoleDestination, logDestination } from '@santa';
import addIcon from '../asset/add.svg';
import converterDriveIcon from '../asset/converter_drive.svg';
import deleteIcon from '../asset/delete.svg';
import folderDriveIcon from '../asset/folder_drive.svg';
import folderLocalIcon from '../asset/folder_local.svg';
import thothIcon from '../asset/thoth.svg';
import unknownDriveIcon from '../asset/unknown_drive.svg';
import { RootView } from '../view/root/root-view';

const iconConfigs: Map<string, SvgConfig> = new Map([
  ['add', {type: 'embed', content: addIcon}],
  ['c_dr', {type: 'embed', content: converterDriveIcon}],
  ['delete', {type: 'embed', content: deleteIcon}],
  ['f_dr', {type: 'embed', content: folderDriveIcon}],
  ['f_lo', {type: 'embed', content: folderLocalIcon}],
  ['u_dr', {type: 'embed', content: unknownDriveIcon}],
  ['thoth', {type: 'embed', content: thothIcon}],
]);

logDestination.set(new ConsoleDestination());
window.addEventListener('load', () => {
  const theme = new Theme(Palette.PURPLE, Palette.GREEN);
  const {vine} = start(
      'thoth',
      [RootView],
      theme,
      document.getElementById('globalStyle') as HTMLStyleElement,
  );

  const svgConfigSubject = $svgConfig.get(vine);
  for (const [key, config] of iconConfigs) {
    svgConfigSubject.next({key, type: 'set', value: config});
  }
});
