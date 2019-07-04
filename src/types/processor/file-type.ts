import * as contentType from 'content-type';

export interface FileType {
  subtype: string;
  type: string;
}

export function newFileType(description: string): FileType {
  const parsedType = contentType.parse(description);
  const parts = parsedType.type.split('/');
  if (parts.length < 2) {
    throw new Error(`String ${description} has invalid type`);
  }

  return {subtype: parts[1], type: parts[0]};
}

export function isAssignableTo(from: FileType, to: FileType): boolean {
  if (to.type !== '*' && to.type !== from.type) {
    return false;
  }

  if (to.subtype === '*') {
    return true;
  }

  return to.subtype === from.subtype;
}
