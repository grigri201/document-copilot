import { LLMProvider } from './LLMProvider';

/**
 * OpenAI API provider implementation
 */
export class OpenAIProvider extends LLMProvider {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey: string, model: string, baseUrl: string) {
    super();
    this.apiKey = apiKey;
    this.model = model || 'gpt-4';
    this.baseUrl = baseUrl || 'https://api.openai.com/v1';
  }

  async completion(llm: string, currentContent: string, prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI completion error:', error);
      throw error;
    }
  }
}