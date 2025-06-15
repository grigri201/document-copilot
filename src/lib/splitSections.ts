import { Lexer } from 'marked';

export default function splitSections(content: string): string[] {
  const tokens = Lexer.lex(content);
  const sections: string[] = [];

  for (const token of tokens) {
    if (token.type === 'space') {
      sections.push('');
      continue;
    }

    let raw = token.raw as string;
    const newlineMatch = raw.match(/(\r?\n)+$/);
    if (newlineMatch) {
      raw = raw.slice(0, -newlineMatch[0].length);
    }

    sections.push(raw);

    if (newlineMatch) {
      const newline = newlineMatch[0].replace(/\r/g, '');
      const groups = Math.floor(newline.length / 2);
      for (let i = 0; i < groups; i++) {
        sections.push('');
      }
      if (newline.length % 2) {
        sections.push('');
      }
    }
  }

  return sections;
}
