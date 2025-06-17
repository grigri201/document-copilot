/**
 * Abstract base class for LLM providers
 */
export abstract class LLMProvider {
  /**
   * Send a completion request to the LLM
   * @param llm - The LLM identifier/model name
   * @param currentContent - The current content being edited
   * @param prompt - The prompt to send to the LLM
   * @returns The completion response from the LLM
   */
  abstract completion(llm: string, currentContent: string, prompt: string): Promise<string>;
}