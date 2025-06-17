import { LLMProvider } from './LLMProvider';

/**
 * LLM provider that opens web interfaces and uses clipboard for input
 */
export class WebLLMProvider extends LLMProvider {
  private readonly llmUrls: Record<string, string> = {
    'chatgpt': 'https://chat.openai.com',
    'claude': 'https://claude.ai',
    'gemini': 'https://gemini.google.com',
    'perplexity': 'https://www.perplexity.ai',
    'copilot': 'https://copilot.microsoft.com',
  };

  async completion(llm: string, currentContent: string, prompt: string): Promise<string> {
    console.log('[WebLLMProvider] Processing completion request');
    console.log('[WebLLMProvider] LLM:', llm);
    console.log('[WebLLMProvider] Current content length:', currentContent.length);
    console.log('[WebLLMProvider] Prompt length:', prompt.length);
    
    try {
      await navigator.clipboard.writeText(prompt);
      console.log('[WebLLMProvider] ✅ Prompt copied to clipboard successfully');
      console.log('[WebLLMProvider] First 200 chars of prompt:', prompt.substring(0, 200));
    } catch (error) {
      console.error('[WebLLMProvider] ❌ Failed to copy to clipboard:', error);
    }

    const url = this.llmUrls[llm.toLowerCase()] || `https://www.google.com/search?q=${encodeURIComponent(llm)}`;
    console.log('[WebLLMProvider] Opening URL:', url);
    
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
      console.log('[WebLLMProvider] ✅ Opened LLM interface in new tab');
    }

    console.log('[WebLLMProvider] Returning empty response (user will paste manually)');
    return '';
  }
}