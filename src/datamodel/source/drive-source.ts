import { SerializableDriveSource, SerializableSource } from '../../serializable/serializable-source';
import { Source } from '../source';

export class DriveSource extends Source {
  constructor(readonly serializable: SerializableDriveSource) {
    super(serializable);
  }

  get driveId(): string {
    return this.serializable.driveId;
  }
}
