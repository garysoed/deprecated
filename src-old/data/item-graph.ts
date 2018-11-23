import { registerDataGraph, SimpleSearcher } from 'external/gs_tools/src/datamodel';
import { DataModelParser } from 'external/gs_tools/src/parse';
import { LocalStorage } from 'external/gs_tools/src/store';

import { Item } from '../data/item';

export const $items = registerDataGraph<Item>(
    'items',
    new SimpleSearcher(),
    new LocalStorage<Item>(window, 'th-i', DataModelParser<Item>()));
