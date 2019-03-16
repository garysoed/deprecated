import { $pipe, $push, asImmutableMap } from 'gs-tools/export/collect';
import { $svgConfig, Palette, start, SvgConfig, Theme } from 'mask/export';
import { take } from 'rxjs/operators';
import { ConsoleDestination, logDestination } from 'santa/export';
import { ProjectListView } from '../view/projectlist/project-list-view';
import { RootView } from '../view/root/root-view';

const iconConfigs: Map<string, SvgConfig> = new Map([
  ['add', {type: 'remote' as 'remote', url: './asset/add.svg'}],
]);

logDestination.set(new ConsoleDestination());
window.addEventListener('load', () => {
  const theme = new Theme(Palette.PURPLE, Palette.GREEN);
  const {vine} = start(
      [
        RootView,
        ProjectListView,
      ],
      theme,
      document.getElementById('globalStyle') as HTMLStyleElement);

  vine.getObservable($svgConfig)
      .pipe(take(1))
      .subscribe(svgConfig => {
        vine.setValue(
            $svgConfig,
            $pipe(
                svgConfig,
                $push(...iconConfigs),
                asImmutableMap(),
            ),
        );
      });
});
