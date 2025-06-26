'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  // Check if we're in dark mode
  const isDarkMode = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  return (
    <div className={cn(
      "markdown-body max-w-none",
      "px-16 pt-4 pb-72 sm:px-[max(64px,calc(50%-350px))]",
      // Reset first/last child margins
      "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
      // Base text styles
      "text-base text-foreground",
      // Task lists
      "[&_input[type='checkbox']]:mr-2 [&_input[type='checkbox']]:mt-0 [&_input[type='checkbox']]:align-middle",
      className
    )}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // GitHub-style headings
          h1: ({ children, ...props }) => (
            <h1 className="text-3xl font-semibold mt-6 mb-4 pb-2 border-b border-border" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-2xl font-semibold mt-6 mb-4 pb-2 border-b border-border" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-xl font-semibold mt-6 mb-4" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="text-base font-semibold mt-6 mb-4" {...props}>
              {children}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 className="text-sm font-semibold mt-6 mb-4" {...props}>
              {children}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 className="text-sm font-semibold text-muted-foreground mt-6 mb-4" {...props}>
              {children}
            </h6>
          ),
          // GitHub-style paragraphs
          p: ({ children, ...props }) => (
            <p className="my-4 leading-7" {...props}>
              {children}
            </p>
          ),
          // GitHub-style code blocks
          pre: ({ children, ...props }) => (
            <pre className="overflow-x-auto rounded-md bg-[#f6f8fa] dark:bg-[#161b22] p-4 my-4 text-sm leading-normal" {...props}>
              {children}
            </pre>
          ),
          code: ({ inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            if (!inline && match) {
              return (
                <SyntaxHighlighter
                  style={isDarkMode ? oneDark : oneLight}
                  language={language}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    backgroundColor: isDarkMode ? '#161b22' : '#f6f8fa',
                  }}
                  codeTagProps={{
                    style: {
                      fontSize: '0.875rem',
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                    }
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              );
            }
            
            return (
              <code className="rounded-md bg-[#afb8c133] dark:bg-[#6e768166] px-[0.3em] py-[0.2em] font-mono text-[85%]" {...props}>
                {children}
              </code>
            );
          },
          // GitHub-style blockquotes
          blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-4 border-muted-foreground/30 pl-4 py-1 my-4 text-muted-foreground" {...props}>
              {children}
            </blockquote>
          ),
          // GitHub-style tables
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="border-collapse w-full" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead {...props}>
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }) => (
            <tbody {...props}>
              {children}
            </tbody>
          ),
          tr: ({ children, ...props }) => (
            <tr className="border-t border-border" {...props}>
              {children}
            </tr>
          ),
          th: ({ children, ...props }) => (
            <th className="border border-border px-3 py-1.5 text-left font-semibold bg-muted/50" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="border border-border px-3 py-1.5" {...props}>
              {children}
            </td>
          ),
          // GitHub-style links
          a: ({ children, href, ...props }) => (
            <a href={href} className="text-[#0969da] dark:text-[#58a6ff] no-underline hover:underline" {...props}>
              {children}
            </a>
          ),
          // GitHub-style horizontal rule
          hr: ({ ...props }) => (
            <hr className="my-6 h-[0.25em] border-0 bg-border" {...props} />
          ),
          // GitHub-style lists
          ul: ({ children, ...props }) => (
            <ul className="my-4 list-disc pl-8" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="my-4 list-decimal pl-8" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="my-0.5 pl-1" {...props}>
              {children}
            </li>
          ),
          // GitHub-style images
          img: ({ src, alt, ...props }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={src} 
              alt={alt} 
              className="max-w-full h-auto rounded-md my-4 shadow-sm" 
              loading="lazy"
              {...props} 
            />
          ),
          // GitHub-style emphasis
          em: ({ children, ...props }) => (
            <em className="italic" {...props}>
              {children}
            </em>
          ),
          strong: ({ children, ...props }) => (
            <strong className="font-semibold" {...props}>
              {children}
            </strong>
          ),
          // GitHub-style strikethrough
          del: ({ children, ...props }) => (
            <del className="line-through text-muted-foreground" {...props}>
              {children}
            </del>
          ),
          // GitHub-style keyboard shortcuts
          kbd: ({ children, ...props }) => (
            <kbd className="inline-block px-1.5 py-0.5 text-xs font-mono leading-none whitespace-nowrap align-middle bg-muted border border-border rounded shadow-sm" {...props}>
              {children}
            </kbd>
          ),
          // GitHub-style input (for task lists)
          input: ({ type, checked, ...props }) => {
            if (type === 'checkbox') {
              return (
                <input 
                  type="checkbox" 
                  checked={checked} 
                  disabled={true}
                  className="mr-2 align-middle"
                  readOnly
                  {...props} 
                />
              );
            }
            return <input type={type} {...props} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}