export default function splitSections(content: string): string[] {
  const sections: string[] = [];
  const lines = content.split(/\r?\n/);
  let i = 0;

  const listRegex = /^\s*(?:[-+*]|\d+\.)\s+/;
  const hrRegex = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/;
  const quoteRegex = /^>/;

  while (i < lines.length) {
    const line = lines[i];

    // code block
    if (/^```/.test(line)) {
      const block: string[] = [line];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        block.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        block.push(lines[i]);
        i++;
      }
      sections.push(block.join("\n"));
      continue;
    }

    // block quote
    if (quoteRegex.test(line)) {
      const block: string[] = [line];
      i++;
      while (i < lines.length && quoteRegex.test(lines[i])) {
        block.push(lines[i]);
        i++;
      }
      sections.push(block.join("\n"));
      continue;
    }

    // list
    if (listRegex.test(line)) {
      const block: string[] = [line];
      i++;
      while (i < lines.length && listRegex.test(lines[i])) {
        block.push(lines[i]);
        i++;
      }
      sections.push(block.join("\n"));
      continue;
    }

    // horizontal rule
    if (hrRegex.test(line)) {
      sections.push(line);
      i++;
      continue;
    }

    sections.push(line);
    i++;
  }

  return sections;
}
