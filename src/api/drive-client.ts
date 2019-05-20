import { GapiHandler } from '@gs-tools/gapi';
import { _v } from '@mask';
import { from, Observable } from '@rxjs';
import { map, switchMap } from '@rxjs/operators';
import { $gapiClient as $gapiClient } from './gapi-client';

class DriveClient {
  constructor(private readonly handler: GapiHandler) {}

  find(q: string): Observable<gapi.client.drive.File[]> {
    return this.handler.ensureSignedIn()
        .pipe(
            switchMap(() => from(gapi.client.drive.files.list({q}))),
            map(result => result.result.files || []),
        );
  }
}

export const $driveClient = _v.stream(
    vine => $gapiClient.get(vine).pipe(map(gapiHandler => new DriveClient(gapiHandler))),
    globalThis,
);
