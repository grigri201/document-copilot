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

  it('handles nested lists and multiple code blocks', () => {
    const sample = `- item 1\n  - subitem 1\n  - subitem 2\n\n\`\`\`js\ncode1\n\`\`\`\n\nSome text.\n\n\`\`\`python\ncode2\n\`\`\`\n`;

    const result = splitSections(sample);
    expect(result).toEqual([
      '- item 1\n  - subitem 1\n  - subitem 2',
      '',
      '```js\ncode1\n```',
      '',
      'Some text.',
      '',
      '```python\ncode2\n```',
      ''
    ]);
  });
});
