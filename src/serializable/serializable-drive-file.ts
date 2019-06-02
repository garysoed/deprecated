import { DriveItemId } from './item-id';
import { SerializableItem } from './serializable-item';

export interface SerializableDriveFile extends SerializableItem {
  id: DriveItemId;
}
