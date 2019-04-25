import { $pipe, $push, asImmutableMap } from '@gs-tools/collect';
import { $svgConfig, Palette, start, SvgConfig, Theme } from '@mask';
import { ConsoleDestination, logDestination } from '@santa';
import { take } from 'rxjs/operators';
import { ProjectListView } from '../view/projectlist/project-list-view';
import { RootView } from '../view/root/root-view';

const iconConfigs: Map<string, SvgConfig> = new Map([
  ['add', {type: 'remote' as 'remote', url: './asset/add.svg'}],
]);

logDestination.set(new ConsoleDestination());
window.addEventListener('load', () => {
  const theme = new Theme(Palette.PURPLE, Palette.GREEN);
  const {vine} = start(
      'thoth',
      [
        RootView,
        ProjectListView,
      ],
      theme,
      document.getElementById('globalStyle') as HTMLStyleElement);

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
