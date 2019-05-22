import { SerializableSource } from '../serializable/serializable-source';
import { SourceType } from './source-type';

export abstract class Source {
  constructor(readonly serializable: SerializableSource) { }

  get type(): SourceType {
    return this.serializable.type;
  }
}
