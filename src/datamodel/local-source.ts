import { SerializableSource } from '../serializable/serializable-source';
import { Source } from './source';

export class LocalSource extends Source {
  constructor(readonly serializable: SerializableSource) {
    super(serializable);
  }
}
