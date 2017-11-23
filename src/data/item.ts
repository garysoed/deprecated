import { DataModel, field } from 'external/gs_tools/src/datamodel';
import { ImmutableMap } from 'external/gs_tools/src/immutable';
import { StringParser } from 'external/gs_tools/src/parse';
import { SimpleIdGenerator } from 'external/gs_tools/src/random';

const ID_GENERATOR = new SimpleIdGenerator();
const EXISTING_IDS = new Set<string>();

export function getInitMap_(id: string, name: string, parentId: string | null):
    ImmutableMap<string | symbol, any> {
  return ImmutableMap.of<string | symbol, any>([
    ['id_', id],
    ['name_', name],
    ['parentId_', parentId],
  ]);
}

export abstract class Item implements DataModel<{ name: string }> {
  @field('id', StringParser) readonly id_: string;
  @field('name', StringParser) readonly name_: string;
  @field('parentId', StringParser) readonly parentId_: string | null;

  constructor() { }

  abstract getId(): string;

  abstract getName(): string;

  abstract getParentId(): string | null;

  abstract getSearchIndex(): {name: string};

  static newId(): string {
    const id = ID_GENERATOR.generate(EXISTING_IDS);
    EXISTING_IDS.add(id);
    return id;
  }
}
