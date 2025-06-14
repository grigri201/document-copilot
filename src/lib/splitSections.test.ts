import splitSections from './splitSections';

describe('splitSections', () => {
  it('splits markdown content into logical sections', () => {
    const sample = `# Sample Article

This is a paragraph.

- item 1
- item 2

> quote line 1
> quote line 2

---

\`\`\`
code block
\`\`\`
`;

    const result = splitSections(sample);
    expect(result).toEqual([
      '# Sample Article',
      '',
      'This is a paragraph.',
      '',
      '- item 1\n- item 2',
      '',
      '> quote line 1\n> quote line 2',
      '',
      '---',
      '',
      '```\ncode block\n```',
      ''
    ]);
  });
});
