import { SerializableSource } from '../serializable/serializable-source';
import { Source } from './source';
import { SourceType } from './source-type';

export class LocalSource extends Source<SourceType.LOCAL> {
  constructor(readonly serializable: SerializableSource<SourceType.LOCAL>) {
    super(serializable);
  }
}
