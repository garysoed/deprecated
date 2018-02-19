import { Serializable } from 'external/gs_tools/src/data';
import { DataModels } from 'external/gs_tools/src/datamodel';

import { ImmutableMap } from 'external/gs_tools/src/immutable';
import { Source } from '../datasource/source';


@Serializable('datasource.ThothSource')
export abstract class ThothSource extends Source {
  toString(): string {
    return `ThothSource()`;
  }

  static newInstance(): ThothSource {
    return DataModels.newInstance(
        ThothSource,
        ImmutableMap.of([]));
  }
}
