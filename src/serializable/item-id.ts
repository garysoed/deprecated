import { Errors } from '@gs-tools/error';
import { EnumType, HasPropertiesType, StringType } from '@gs-types';
import { Result, Serializable, SerializableObject } from '@nabu';
import { SourceType } from '../datamodel/source-type';

const SEPARATOR = '_';

export interface BaseItemId extends SerializableObject {
  readonly id: string;
  readonly source: SourceType;
}

export interface DriveItemId extends BaseItemId {
  readonly source: SourceType.DRIVE;
}

export interface LocalItemId extends BaseItemId {
  readonly source: SourceType.LOCAL;
}

export type ItemId = DriveItemId|LocalItemId;

export function toItemString(itemId: BaseItemId): string {
  return `${itemId.source}${SEPARATOR}${itemId.id}`;
}

export function parseId(idStr: string): BaseItemId {
  const [sourceType, id] = idStr.split(SEPARATOR);

  if (!EnumType(SourceType).check(sourceType)) {
    throw Errors.assert('sourceType').shouldBeA(EnumType(SourceType)).butWas(sourceType);
  }

  if (!StringType.check(id)) {
    throw Errors.assert('id').shouldBeA(StringType).butWas(id);
  }

  // tslint:disable-next-line: no-object-literal-type-assertion
  return {id, source: sourceType as SourceType};
}

export const ItemIdType = HasPropertiesType<BaseItemId>({
  id: StringType,
  source: EnumType(SourceType),
});

export const ITEM_ID_CONVERTER = {
  convertBackward(serializable: Serializable): Result<BaseItemId> {
    if (!ItemIdType.check(serializable)) {
      return {success: false};
    }

    return {success: true, result: serializable};
  },

  convertForward(value: ItemId): Result<Serializable> {
    return {success: true, result: {...value} as any};
  },
};
