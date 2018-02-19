import { DataModel, field } from 'external/gs_tools/src/datamodel';
import { ImmutableMap } from 'external/gs_tools/src/immutable';
import { DataModelParser, StringParser } from 'external/gs_tools/src/parse';

import { Source } from '../datasource/source';

export function getInitMap_(id: string, name: string, parentId: string | null, source: Source):
    ImmutableMap<string | symbol, any> {
  return ImmutableMap.of<string | symbol, any>([
    ['id_', id],
    ['name_', name],
    ['parentId_', parentId],
    ['source_', source],
  ]);
}

export abstract class Item<S extends Source> implements DataModel<string> {
  @field('id', StringParser) readonly id_!: string;
  @field('name', StringParser) readonly name_!: string;
  @field('parentId', StringParser) readonly parentId_!: string | null;
  @field('source', DataModelParser<S>()) readonly source_!: S;

  constructor() { }

  abstract getId(): string;

  abstract getName(): string;

  abstract getParentId(): string | null;

  abstract getSearchIndex(): string;

  abstract getSource(): S;

  abstract setName(name: string): this;
}
