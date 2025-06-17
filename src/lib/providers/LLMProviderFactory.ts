import { LLMProvider } from './LLMProvider';
import { WebLLMProvider } from './WebLLMProvider';
import { OpenAIProvider } from './OpenAIProvider';

/**
 * Factory for creating LLM providers based on user configuration
 */
export class LLMProviderFactory {
  static create(): LLMProvider {
    if (typeof window === 'undefined') {
      throw new Error('LLMProvider can only be initialized in browser environment');
    }

    const provider = localStorage.getItem('api_provider') || 'chatgpt';

    switch (provider) {
      case 'chatgpt':
        return new WebLLMProvider();
      
      case 'openai':
        const apiKey = localStorage.getItem('openai_api_key') || '';
        const model = localStorage.getItem('openai_model') || 'gpt-4';
        const baseUrl = localStorage.getItem('openai_base_url') || 'https://api.openai.com/v1';
        return new OpenAIProvider(apiKey, model, baseUrl);
      
      default:
        return new WebLLMProvider();
    }
  }
}