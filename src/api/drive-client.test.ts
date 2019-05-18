import { Vine } from '@grapevine';
import { assert, createSpy, createSpyInstance, fake, match, setup, should, Spy, SpyObj, test } from '@gs-testing';
import { GapiHandler } from '@gs-tools/gapi';
import { _v } from '@mask';
import { of as observableOf } from '@rxjs';
import { switchMap } from '@rxjs/operators';
import { $driveClient } from './drive-client';
import { $gapiService as $gapiClient, $gapiUrl } from './gapi-client';

test('@thoth/api/drive-client', () => {
  let vine: Vine;
  let mockGapiHandler: SpyObj<GapiHandler>;
  let mockFilesList: Spy<{}, [{}]>;

  setup(() => {
    mockGapiHandler = createSpyInstance(GapiHandler);
    fake(mockGapiHandler.ensureSignedIn).always().return(observableOf(true));

    mockFilesList = createSpy('FilesList');
    Object.assign(
        window,
        {
          gapi: {
            client: {
              drive: {
                files: {list: mockFilesList},
              },
            },
          },
        },
    );

    vine = _v.build('test');
    $gapiUrl.get(vine).next('');
    $gapiClient.get(vine).next(mockGapiHandler);
  });

  test('find', () => {
    should(`return the correct data`, async () => {
      const query = 'query';
      const result = {};
      fake(mockFilesList).always().return(observableOf(result));

      await assert($driveClient.get(vine).pipe(switchMap(client => client.find(query))))
          .to.emitWith(result);
      assert(mockFilesList).to.haveBeenCalledWith(match.anyObjectThat().haveProperties({q: query}));
    });
  });
});
