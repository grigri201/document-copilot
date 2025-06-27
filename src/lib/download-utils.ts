export async function downloadAsHtml(content: string, filename: string = 'document.html') {
  // Create a blob with the HTML content
  const blob = new Blob([content], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Create a temporary anchor element and trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // Clean up the URL
  URL.revokeObjectURL(url);
}

export function generateHtmlDocument(markdownHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #24292f;
      background-color: #ffffff;
      margin: 0;
      padding: 40px;
      max-width: 900px;
      margin: 0 auto;
    }
    
    h1, h2, h3, h4, h5, h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }
    
    h1 { font-size: 2em; border-bottom: 1px solid #d0d7de; padding-bottom: .3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #d0d7de; padding-bottom: .3em; }
    h3 { font-size: 1.25em; }
    h4 { font-size: 1em; }
    h5 { font-size: .875em; }
    h6 { font-size: .85em; color: #57606a; }
    
    p { margin-bottom: 16px; }
    
    code {
      padding: .2em .4em;
      margin: 0;
      font-size: 85%;
      white-space: break-spaces;
      background-color: rgba(175,184,193,0.2);
      border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
    }
    
    pre {
      margin-bottom: 16px;
      padding: 16px;
      overflow: auto;
      font-size: 85%;
      line-height: 1.45;
      background-color: #f6f8fa;
      border-radius: 6px;
    }
    
    pre code {
      display: inline;
      padding: 0;
      margin: 0;
      overflow: visible;
      line-height: inherit;
      word-wrap: normal;
      background-color: transparent;
      border: 0;
    }
    
    blockquote {
      margin: 0 0 16px 0;
      padding: 0 1em;
      color: #57606a;
      border-left: .25em solid #d0d7de;
    }
    
    ul, ol {
      margin-bottom: 16px;
      padding-left: 2em;
    }
    
    li + li {
      margin-top: .25em;
    }
    
    table {
      border-collapse: collapse;
      margin-bottom: 16px;
      width: 100%;
    }
    
    table th,
    table td {
      padding: 6px 13px;
      border: 1px solid #d0d7de;
    }
    
    table tr:nth-child(2n) {
      background-color: #f6f8fa;
    }
    
    table th {
      font-weight: 600;
      background-color: #f6f8fa;
    }
    
    hr {
      height: .25em;
      padding: 0;
      margin: 24px 0;
      background-color: #d0d7de;
      border: 0;
    }
    
    a {
      color: #0969da;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    img {
      max-width: 100%;
      box-sizing: content-box;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      
      pre {
        page-break-inside: avoid;
      }
      
      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid;
      }
    }
  </style>
</head>
<body>
  ${markdownHtml}
</body>
</html>`;
}