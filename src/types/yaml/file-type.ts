import * as contentType from 'content-type';

export class FileType {
  constructor(private readonly description: string) { }

  isAssignableTo(other: FileType): boolean {
    const parsedOther = parseDescription(other.description);
    const parsedThis = parseDescription(this.description);

    if (parsedOther.type !== '*' && parsedOther.type !== parsedThis.type) {
      return false;
    }

    if (parsedOther.subtype === '*') {
      return true;
    }

    return parsedOther.subtype === parsedThis.subtype;
  }
}

function parseDescription(description: string): {subtype: string; type: string} {
  const parsedType = contentType.parse(description);
  const parts = parsedType.type.split('/');
  if (parts.length < 2) {
    throw new Error(`String ${description} has invalid type`);
  }

  return {subtype: parts[1], type: parts[0]};
}
