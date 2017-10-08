import { GapiLibrary } from 'external/gs_tools/src/net';

import { gapiClient } from '../api/gapi-client';

export const drive = GapiLibrary.create<goog.Drive>(
    gapiClient,
    ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    ['https://www.googleapis.com/auth/drive.metadata.readonly'],
    'drive',
    true);
