import { SerializableSource } from './serializable-source';

export interface SerializableFolder {
  readonly contentIds: string[];
  readonly id: string;
  readonly name: string;
  readonly source: SerializableSource<any>;
}
