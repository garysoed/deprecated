import { Errors } from '@gs-tools/error';
import { generateImmutable, Immutable } from '@gs-tools/immutable';
import { BaseItemId } from '../serializable/item-id';
import { SerializableItem } from '../serializable/serializable-item';
import { ItemType } from './item-type';
import { SourceType } from './source-type';

export class ItemSpec {
  constructor(private readonly serializableItem: SerializableItem) { }

  get id(): BaseItemId {
    return {...this.serializableItem.id};
  }

  get isEditable(): boolean {
    return this.serializableItem.isEditable;
  }

  get name(): string {
    return this.serializableItem.name;
  }
  set name(newName: string) {
    this.serializableItem.name = newName;
  }

  get type(): ItemType {
    return this.serializableItem.type;
  }
}

export const itemFactory = generateImmutable(ItemSpec);
export type Item = Immutable<ItemSpec, SerializableItem>;
