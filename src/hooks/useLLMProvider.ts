import { useState, useEffect, useCallback } from 'react';
import { LLMProvider } from '@/lib/providers/LLMProvider';
import { LLMProviderFactory } from '@/lib/providers/LLMProviderFactory';
import { editPrompt } from '@/lib/prompts/editPrompt';

interface UseLLMProviderReturn {
  sendPrompt: (prompt: string, currentContent?: string) => Promise<string>;
  isLoading: boolean;
  error: string | null;
  provider: LLMProvider | null;
}

export function useLLMProvider(): UseLLMProviderReturn {
  const [provider, setProvider] = useState<LLMProvider | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const llmProvider = LLMProviderFactory.create();
      setProvider(llmProvider);
      setError(null);
    } catch (err) {
      console.error('Failed to initialize LLM provider:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize provider');
    }
  }, []);

  const sendPrompt = useCallback(async (prompt: string, currentContent?: string): Promise<string> => {
    if (!provider) {
      throw new Error('LLM provider not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      const fullPrompt = editPrompt(currentContent || '', prompt)
      const response = await provider.completion('chatgpt', currentContent || '', fullPrompt);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send prompt';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  return {
    sendPrompt,
    isLoading,
    error,
    provider
  };
}