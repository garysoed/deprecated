import { SerializableSource } from '../serializable/serializable-source';
import { LocalSource } from './local-source';
import { Source } from './source';
import { SourceType } from './source-type';

export function createSource(serializable: SerializableSource<SourceType.LOCAL>): LocalSource;
export function createSource(serializable: SerializableSource<SourceType>): Source<SourceType> {
  switch (serializable.type) {
    case SourceType.LOCAL:
      return new LocalSource(serializable as SerializableSource<SourceType.LOCAL>);
  }
}
