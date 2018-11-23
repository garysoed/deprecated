import { registerDataGraph, SimpleSearcher } from 'external/gs_tools/src/datamodel';
import { DataModelParser } from 'external/gs_tools/src/parse';
import { LocalStorage } from 'external/gs_tools/src/store';

import { Project } from '../data/project';

export const $project = registerDataGraph<Project>(
    'project',
    new SimpleSearcher(),
    new LocalStorage(window, 'th-p', DataModelParser<Project>()));
