import { $window, _v } from '@mask';
import { LocationService, Route, RouteSpec } from '@persona';
import { map } from '@rxjs/operators';

export interface Routes {
  'MAIN': {};
  'PROJECT': {route: string};
}

const ROUTE_SPEC: Array<RouteSpec<keyof Routes>> = [
  {path: '/p/:route', type: 'PROJECT'},
  {path: '/', type: 'MAIN'},
];

const DEFAULT_ROUTE: Route<Routes, 'MAIN'> = {payload: {}, type: 'MAIN'};

export const $locationService = _v.stream(
    vine => $window.get(vine)
        .pipe(map(windowObj => new LocationService<Routes>(ROUTE_SPEC, DEFAULT_ROUTE, windowObj))),
    globalThis,
);
