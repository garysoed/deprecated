import { SourceType } from '../datamodel/source-type';

export interface SerializableSource<T extends SourceType> {
  type: T;
}
