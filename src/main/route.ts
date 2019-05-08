import { _v } from '@mask';
import { LocationService, RouteSpec } from '@persona';
import { BehaviorSubject } from '@rxjs';

export interface Routes {
  'MAIN': {};
  'PROJECT_MAIN': {projectId: string};
}

const ROUTE_SPEC: Array<RouteSpec<keyof Routes>> = [
  {path: '/p/:projectId', type: 'PROJECT_MAIN'},
  {path: '/', type: 'MAIN'},
];

export const $locationService = _v.source(
    () => new BehaviorSubject(
        new LocationService(ROUTE_SPEC, {payload: {}, type: 'MAIN'}),
    ),
    globalThis,
);
