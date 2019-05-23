import { Errors } from '@gs-tools/error';
import { EnumType, StringType } from '@gs-types';
import { SerializableItemId } from 'src/serializable/serializable-item-id';
import { SourceType } from './source-type';

const SEPARATOR = '_';

export class ItemId {
  constructor(readonly serializable: SerializableItemId) { }

  toString(): string {
    return `${this.serializable.source}${SEPARATOR}${this.serializable.id}`;
  }
}

export function parseId(idStr: string): ItemId {
  const [sourceType, id] = idStr.split(SEPARATOR);

  if (!EnumType(SourceType).check(sourceType)) {
    throw Errors.assert('sourceType').shouldBeA(EnumType(SourceType)).butWas(sourceType);
  }

  if (!StringType.check(id)) {
    throw Errors.assert('id').shouldBeA(StringType).butWas(id);
  }

  return new ItemId({id, source: sourceType as SourceType});
}

