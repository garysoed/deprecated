import { SerializableSource } from '../serializable/serializable-source';
import { LocalSource } from './local-source';
import { Source } from './source';
import { SourceType } from './source-type';

export function createSource(serializable: SerializableSource): LocalSource;
export function createSource(serializable: SerializableSource): Source {
  switch (serializable.type) {
    case SourceType.LOCAL:
      return new LocalSource(serializable);
  }
}
