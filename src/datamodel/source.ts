import { SerializableSource } from '../serializable/serializable-source';
import { SourceType } from './source-type';

export abstract class Source<T extends SourceType> {
  constructor(readonly serializable: SerializableSource<T>) { }
}
