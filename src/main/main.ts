import { $pipe, $push, asImmutableMap } from '@gs-tools/collect';
import { $svgConfig, Palette, start, SvgConfig, Theme } from '@mask';
import { take } from '@rxjs/operators';
import { ConsoleDestination, logDestination } from '@santa';
import * as addIcon from '../asset/add.svg';
import * as converterDriveIcon from '../asset/converter_drive.svg';
import * as deleteIcon from '../asset/delete.svg';
import * as folderDriveIcon from '../asset/folder_drive.svg';
import * as folderLocalIcon from '../asset/folder_local.svg';
import * as thothIcon from '../asset/thoth.svg';
import { RootView } from '../view/root/root-view';

const iconConfigs: Map<string, SvgConfig> = new Map([
  ['add', {type: 'embed', content: addIcon}],
  ['c_dr', {type: 'embed', content: converterDriveIcon}],
  ['delete', {type: 'embed', content: deleteIcon}],
  ['f_dr', {type: 'embed', content: folderDriveIcon}],
  ['f_lo', {type: 'embed', content: folderLocalIcon}],
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
  svgConfigSubject
      .pipe(take(1))
      .subscribe(svgConfig => {
        svgConfigSubject.next(
            $pipe(
                svgConfig,
                $push(...iconConfigs),
                asImmutableMap(),
            ),
        );
      });
});
