import { SerializableItemMetadata } from '../serializable/serializable-item-metadata';
import { Source } from './source';
import { createSource } from './source-factory';

export class ItemMetadata {
  readonly source: Source;

  constructor(readonly serializable: SerializableItemMetadata) {
    this.source = createSource(serializable.source);
  }

  get id(): string {
    return this.serializable.id;
  }

  get isEditable(): boolean {
    return this.serializable.isEditable;
  }

  get name(): string {
    return this.serializable.name;
  }
}
