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