import { Vine } from '@grapevine';
import { createSpy, createSpyInstance, fake, Spy } from '@gs-testing';
import { GapiHandler } from '@gs-tools/gapi';
import { Observable, of as observableOf, ReplaySubject, Subject } from '@rxjs';
import { $gapiClient, $gapiUrl } from '../api/gapi-client';

interface FakeDriveFilesClient {
  list: Spy<Observable<gapi.client.Response<gapi.client.drive.FileList>>, [{}]>;
  listSubject: Subject<gapi.client.Response<gapi.client.drive.FileList>>;
}

interface FakeDriveClient {
  files: FakeDriveFilesClient;
}

export interface FakeGapiClient {
  drive: FakeDriveClient;
}

export function installFakeGapiClient(vine: Vine): FakeGapiClient {
  const driveFilesListSubject =
      new ReplaySubject<gapi.client.Response<gapi.client.drive.FileList>>(1);
  const fakeGapiClient = {
    drive: {
      files: {
        list: createSpy<Subject<gapi.client.Response<gapi.client.drive.FileList>>, [{}]>(''),
        listSubject: driveFilesListSubject,
      },
    },
  };

  fake(fakeGapiClient.drive.files.list).always().return(driveFilesListSubject);

  Object.assign(window, {gapi: {client: fakeGapiClient}});

  const mockGapiHandler = createSpyInstance(GapiHandler);
  fake(mockGapiHandler.ensureSignedIn).always().return(observableOf(true));
  $gapiUrl.get(vine).next('');
  $gapiClient.get(vine).next(mockGapiHandler);

  return fakeGapiClient;
}
