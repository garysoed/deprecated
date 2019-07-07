export function createOutputFilename(template: string, outputSpec: Map<string, string>): string {
  let filename = template;
  for (const [key, value] of outputSpec) {
    filename = filename.replace(`[${key}]`, value);
  }

  return filename;
}
