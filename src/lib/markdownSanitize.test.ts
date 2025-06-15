import { JSDOM } from 'jsdom';
import { marked } from 'marked';
import createDOMPurify from 'dompurify';

describe('DOMPurify sanitization', () => {
  const window = new JSDOM('').window;
  // Assign global window before creating DOMPurify
  (global as any).window = window;
  const DOMPurify = createDOMPurify(window);

  it('removes script tags from html', () => {
    const dirtyMarkdown = '<script>alert(1)</script>';
    const html = marked.parse(dirtyMarkdown);
    const clean = DOMPurify.sanitize(html);
    expect(clean).not.toContain('<script>');
  });
});
