import { generateImmutable, Immutable } from '@gs-tools/immutable';
import { DriveItemId } from '../serializable/item-id';
import { SerializableDriveFile } from '../serializable/serializable-drive-file';
import { ItemSpec } from './item';

class DriveItemSpec extends ItemSpec {
  constructor(private readonly serializableDrive: SerializableDriveFile) {
    super(serializableDrive);
  }

  get id(): DriveItemId {
    return {...this.serializableDrive.id};
  }
}

export const driveItemFactory = generateImmutable(DriveItemSpec);
export type DriveItem = Immutable<DriveItemSpec, SerializableDriveFile>;
