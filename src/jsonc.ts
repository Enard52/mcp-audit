export function parseJsonc(text: string): unknown {
  const stripped = text
    .replace(/\\"|"(?:\\"|[^"])*"|(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, (match, group) =>
      group ? "" : match,
    )
    .replace(/,\s*([\]}])/g, "$1");

  return JSON.parse(stripped);
}
