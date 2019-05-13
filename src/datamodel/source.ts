import { SerializableSource } from '../serializable/serializable-source';

export abstract class Source {
  constructor(readonly serializable: SerializableSource) { }
}
