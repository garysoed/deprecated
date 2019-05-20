import { Vine } from '@grapevine';
import { assert, match, setup, should, test } from '@gs-testing';
import { _v } from '@mask';
import { switchMap } from '@rxjs/operators';
import { FakeGapiClient, installFakeGapiClient } from 'src/testing/fake-gapi';
import { $driveClient } from './drive-client';

test('@thoth/api/drive-client', () => {
  let vine: Vine;
  let fakeGapi: FakeGapiClient;

  setup(() => {
    vine = _v.build('test');
    fakeGapi = installFakeGapiClient(vine);
  });

  test('find', () => {
    should(`return the correct data`, async () => {
      const query = 'query';
      const result: Array<{}> = [];
      fakeGapi.drive.files.listSubject.next({result: {files: result}});

      await assert($driveClient.get(vine).pipe(switchMap(client => client.find(query))))
          .to.emitWith(result);
      assert(fakeGapi.drive.files.list).to
          .haveBeenCalledWith(match.anyObjectThat().haveProperties({q: query}));
    });
  });
});
