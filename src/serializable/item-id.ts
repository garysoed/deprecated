import { Errors } from '@gs-tools/error';
import { EnumType, HasPropertiesType, StringType } from '@gs-types';
import { Result, Serializable, SerializableObject } from '@nabu';
import { SourceType } from '../datamodel/source-type';

const SEPARATOR = '_';

export interface ItemId extends SerializableObject {
  readonly id: string;
  readonly source: SourceType;
}

export interface DriveItemId extends ItemId {
  readonly source: SourceType.DRIVE;
}

export interface LocalItemId extends ItemId {
  readonly source: SourceType.LOCAL;
}

export function toItemString(itemId: ItemId): string {
  return `${itemId.source}${SEPARATOR}${itemId.id}`;
}

export function parseId(idStr: string): ItemId {
  const [sourceType, id] = idStr.split(SEPARATOR);

  if (!EnumType(SourceType).check(sourceType)) {
    throw Errors.assert('sourceType').shouldBeA(EnumType(SourceType)).butWas(sourceType);
  }

  if (!StringType.check(id)) {
    throw Errors.assert('id').shouldBeA(StringType).butWas(id);
  }

  return {id, source: sourceType as SourceType};
}

export const ItemIdType = HasPropertiesType<ItemId>({
  id: StringType,
  source: EnumType(SourceType),
});

export const ITEM_ID_CONVERTER = {
  convertBackward(serializable: Serializable): Result<ItemId> {
    if (!ItemIdType.check(serializable)) {
      return {success: false};
    }

    return {success: true, result: serializable};
  },

  convertForward(value: ItemId): Result<Serializable> {
    return {success: true, result: {...value} as any};
  },
};
