import { registerDataGraph, SimpleSearcher } from 'external/gs_tools/src/datamodel';
import { DataModelParser } from 'external/gs_tools/src/parse';
import { LocalStorage } from 'external/gs_tools/src/store';

import { PreviewFile } from '../data/preview-file';

export const $previews = registerDataGraph<PreviewFile>(
    'previews',
    new SimpleSearcher(),
    new LocalStorage<PreviewFile>(window, 'th-r', DataModelParser<PreviewFile>()));
