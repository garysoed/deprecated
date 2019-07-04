import * as contentType from 'content-type';

export class FileType {
  constructor(
      readonly subtype: string,
      readonly type: string,
  ) { }
}

export function newFileType(description: string): FileType {
  const parsedType = contentType.parse(description);
  const parts = parsedType.type.split('/');
  if (parts.length < 2) {
    throw new Error(`String ${description} has invalid type`);
  }

  return new FileType(parts[1], parts[0]);
}
