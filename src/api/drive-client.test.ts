import { Vine } from '@grapevine';
import { assert, match, setup, should, test } from '@gs-testing';
import { _v } from '@mask';
import { switchMap } from '@rxjs/operators';
import { ItemType } from '../datamodel/item-type';
import { SourceType } from '../datamodel/source-type';
import { SerializableDriveFile } from '../serializable/serializable-drive-file';
import { FakeGapiClient, installFakeGapiClient } from '../testing/fake-gapi';
import { $driveClient } from './drive-client';

test('@thoth/api/drive-client', () => {
  let vine: Vine;
  let fakeGapi: FakeGapiClient;

  setup(() => {
    vine = _v.build('test');
    fakeGapi = installFakeGapiClient(vine);
  });

  test('find', () => {
    should(`return the correct data`, () => {
      const query = 'query';
      fakeGapi.drive.files.listSubject.next({
        result: {
          files: [
            {
              id: 'driveId1',
              mimeType: 'application/x-javascript',
              name: 'name1',
            },
            {
              id: 'driveId2',
              mimeType: 'application/vnd.google-apps.folder',
              name: 'name2',
            },
          ],
        },
      });

      assert($driveClient.get(vine).pipe(switchMap(client => client.find(query)))).to.emitWith(
          match.anyArrayThat<SerializableDriveFile>().haveExactElements([
            match.anyObjectThat<SerializableDriveFile>().haveProperties({
              id: match.anyObjectThat().haveProperties({id: 'driveId1', source: SourceType.DRIVE}),
              isEditable: false,
              name: 'name1',
              type: ItemType.CONVERTER,
            }),
            match.anyObjectThat<SerializableDriveFile>().haveProperties({
              id: match.anyObjectThat().haveProperties({id: 'driveId2', source: SourceType.DRIVE}),
              isEditable: false,
              name: 'name2',
              type: ItemType.FOLDER,
            }),
          ]),
      );
      assert(fakeGapi.drive.files.list).to
          .haveBeenCalledWith(match.anyObjectThat().haveProperties({q: query}));
    });
  });
});
