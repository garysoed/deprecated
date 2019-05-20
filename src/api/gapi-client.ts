import { GAPI_URL, GapiBuilder, GapiHandler } from '@gs-tools/gapi';
import { _v } from '@mask';
import { BehaviorSubject, ReplaySubject } from '@rxjs';

export const $gapiUrl = _v.source(() => new BehaviorSubject(GAPI_URL), globalThis);
export const $gapiClient = _v.source(
    () => {
        const subject = new ReplaySubject<GapiHandler>(1);
        new GapiBuilder(
            'AIzaSyDnAQ_Qz1jCl75CpW75Mus-UDdSDKBJDRY',
            '993891266631-31r10cbin1ootvfffkf4a5thlq65smlb.apps.googleusercontent.com',
        )
        .addLibrary({
          discoveryDoc: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
          scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        })
        .build()
        .subscribe(subject);

        return subject;
    },
    globalThis);
