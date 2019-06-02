import { Vine } from '@grapevine';
import { createSpy, createSpyInstance, fake, Spy } from '@gs-testing';
import { GapiHandler } from '@gs-tools/gapi';
import { Observable, of as observableOf, ReplaySubject, Subject } from '@rxjs';
import { $gapiClient } from '../api/gapi-client';

type PartialResponse<T> = Partial<gapi.client.Response<T>>;

interface FakeDriveFilesClient {
  list: Spy<Observable<PartialResponse<gapi.client.drive.FileList>>, [{}]>;
  listSubject: Subject<PartialResponse<gapi.client.drive.FileList>>;
}

interface FakeDriveClient {
  files: FakeDriveFilesClient;
}

export interface FakeGapiClient {
  drive: FakeDriveClient;
}

export function installFakeGapiClient(vine: Vine): FakeGapiClient {
  const driveFilesListSubject =
      new ReplaySubject<PartialResponse<gapi.client.drive.FileList>>(1);
  const fakeGapiClient = {
    drive: {
      files: {
        list: createSpy<Subject<PartialResponse<gapi.client.drive.FileList>>, [{}]>(''),
        listSubject: driveFilesListSubject,
      },
    },
  };

  fake(fakeGapiClient.drive.files.list).always().return(driveFilesListSubject);

  Object.assign(window, {gapi: {client: fakeGapiClient}});

  const mockGapiHandler = createSpyInstance(GapiHandler);
  fake(mockGapiHandler.ensureSignedIn).always().return(observableOf(true));
  $gapiClient.get(vine).next(mockGapiHandler);

  return fakeGapiClient;
}
