import { AbstractRouteFactory, IRouteFactoryService } from 'external/gs_ui/src/routing';
import { Views } from '../route/views';

export class RouteFactoryService implements IRouteFactoryService<Views> {
  getFactories(): AbstractRouteFactory<Views, any, any, any>[] {
    return [];
  }
}
