export function generatePrompt(content: string, question: string): string {
  return `You are an expert editorial assistant.

TASK
• Take the current Markdown document (between <<<DOC_START … DOC_END>>>).
• Apply the user's instruction (between <<<INSTRUCTION … INSTRUCTION_END>>>).
• Return the result as a **unified‑diff patch**.

STRICT DIFF FORMAT
1. Show **exactly one** unchanged context line **above and below** every contiguous change block.
2. Prefix:  
   • unchanged context → " " (single space)  
   • deletions         → "-"  
   • additions         → "+"  
3. No other commentary, headings, or fences—**only the diff lines**.

CONTENT READABILITY RULES
• When adding or modifying content, include appropriate blank lines for readability:
  - Add blank lines between paragraphs
  - Add blank lines before and after headings
  - Add blank lines before and after code blocks
  - Add blank lines before and after lists
  - Add blank lines between distinct sections or ideas
• Maintain consistent spacing throughout the document
• Preserve the document's existing blank line patterns when making edits

EXAMPLE  
Before:
A  
B  
C  

Instruction: replace "B" with "B2"  
Return:
 A  
-B  
+B2  
 C  

DOCUMENT
<<<DOC_START
${content}
DOC_END>>>

INSTRUCTION
<<<INSTRUCTION
${question}
INSTRUCTION_END>>>`;
}