import { _v } from '@mask';
import { LocationService, RouteSpec } from '@persona';
import { BehaviorSubject } from '@rxjs';

export interface Routes {
  'MAIN': {};
  'PROJECT': {folderId: string; projectId: string};
}

const ROUTE_SPEC: Array<RouteSpec<keyof Routes>> = [
  {path: '/p/:projectId/f/:folderId?', type: 'PROJECT'},
  {path: '/', type: 'MAIN'},
];

export const $locationService = _v.source(
    () => new BehaviorSubject(
        new LocationService<Routes>(ROUTE_SPEC, {payload: {}, type: 'MAIN'}),
    ),
    globalThis,
);