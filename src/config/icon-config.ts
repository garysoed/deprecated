import { ImmutableMap } from 'gs-tools/export/collect';
import { icon } from 'mask/export';

export const ICON_CONFIG = icon('material', ImmutableMap.of([
  [
    'material',
    {
      iconClass: 'material-icons',
      url: new URL('https://fonts.googleapis.com/icon?family=Material+Icons'),
    },
  ],
]));
