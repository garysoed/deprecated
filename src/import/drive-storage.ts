import { ImmutableSet } from 'external/gs_tools/src/immutable';
import { GapiLibrary } from 'external/gs_tools/src/net';
import { Storage } from 'external/gs_tools/src/store';

type DriveFolder = {
  contentIds: string[],
  id: string,
};

export class DriveStorage implements Storage<DriveFolder> {
  constructor(private readonly driveLibraryPromise_: Promise<GapiLibrary<goog.Drive>>) { }

  has(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async list(): Promise<ImmutableSet<DriveFolder>> {
    const driveLibrary = await this.driveLibraryPromise_;
    const drive = await driveLibrary.get();
    return ImmutableSet.of(await drive.files.list({
      corpus: 'user',
      includeTeamDriveItems: true,
      pageSize: 30,
      q: `mimeType='application/vnd.google-apps.folder'`,
      supportsTeamDrives: true,
    }));
  }

  listIds(): Promise<ImmutableSet<string>> {
    throw new Error('Method not implemented.');
  }

  read(): Promise<{ contentIds: string[]; id: string; } | null> {
    throw new Error('Method not implemented.');
  }
}
