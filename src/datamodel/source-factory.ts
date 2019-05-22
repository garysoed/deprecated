import { SerializableDriveSource, SerializableSource } from '../serializable/serializable-source';
import { Source } from './source';
import { SourceType } from './source-type';
import { DriveSource } from './source/drive-source';
import { LocalSource } from './source/local-source';

export function createSource(serializable: SerializableDriveSource): DriveSource;
export function createSource(serializable: SerializableSource): LocalSource;
export function createSource(serializable: SerializableSource): Source {
  switch (serializable.type) {
    case SourceType.LOCAL:
      return new LocalSource(serializable);
    case SourceType.DRIVE:
      return new DriveSource(serializable as SerializableDriveSource);
  }
}
