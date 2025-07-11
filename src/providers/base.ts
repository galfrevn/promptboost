import type {
  APIResponse,
  EnhanceOptions,
  EnhanceRequest,
  EnhanceResponse,
  ErrorResponse,
  Provider,
} from '@/types/index.js';
import { ProviderError } from '@/types/index.js';
import { logger } from '@/utils/logger.js';

export abstract class BaseProvider {
  protected provider: Provider;
  protected retries = 3;
  protected timeout = 30000;

  constructor(provider: Provider) {
    this.provider = provider;
  }

  protected async makeRequest(
    url: string,
    options: RequestInit,
    retryCount = 0,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'promptboost/1.0.0',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await this.handleAPIError(response);

        if (error.retryable && retryCount < this.retries) {
          const delay = 2 ** retryCount * 1000;
          logger.warn(`Request failed, retrying in ${delay}ms...`, {
            provider: this.provider.name,
            attempt: retryCount + 1,
          });
          await this.delay(delay);
          return this.makeRequest(url, options, retryCount + 1);
        }

        throw error;
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw this.createError('Request timeout', 'TIMEOUT', true);
      }

      if (error instanceof ProviderError && error.retryable && retryCount < this.retries) {
        const delay = 2 ** retryCount * 1000;
        logger.warn(`Request failed, retrying in ${delay}ms...`, {
          provider: this.provider.name,
          attempt: retryCount + 1,
        });
        await this.delay(delay);
        return this.makeRequest(url, options, retryCount + 1);
      }

      throw error;
    }
  }

  protected async handleAPIError(response: Response): Promise<ProviderError> {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorCode = response.status.toString();
    let retryable = false;

    try {
      const errorData = (await response.json()) as ErrorResponse;
      errorMessage = errorData.error?.message || errorData.message || errorMessage;
      errorCode = errorData.error?.code || errorData.code || errorCode;
    } catch {
      // If we can't parse the error response, use the default message
    }

    // Determine if the error is retryable
    if (response.status === 429 || response.status >= 500) {
      retryable = true;
    }

    return this.createError(errorMessage, errorCode, retryable, response.status);
  }

  protected createError(
    message: string,
    code = '',
    retryable = false,
    statusCode?: number,
  ): ProviderError {
    return new ProviderError(message, this.provider.name, code, retryable, statusCode);
  }

  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  protected async handleStreamResponse(
    response: Response,
    onChunk: (chunk: string) => void,
  ): Promise<string> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw this.createError('No response body to stream');
    }

    const decoder = new TextDecoder();
    let fullContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = this.extractContentFromStreamChunk(parsed);
              if (content) {
                fullContent += content;
                onChunk(content);
              }
            } catch {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullContent;
  }

  protected extractContentFromStreamChunk(chunk: unknown): string {
    // Default implementation - providers should override this
    return '';
  }

  protected countTokens(text: string): number {
    // Simple token estimation - roughly 4 characters per token
    return Math.ceil(text.length / 4);
  }

  protected validateRequest(request: EnhanceRequest): void {
    if (!request.prompt || typeof request.prompt !== 'string') {
      throw new Error('Prompt is required and must be a string');
    }

    if (request.prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty');
    }

    if (!this.provider.apiKey) {
      throw new Error(`API key not configured for provider: ${this.provider.name}`);
    }

    if (!this.provider.enabled) {
      throw new Error(`Provider is disabled: ${this.provider.name}`);
    }
  }

  protected buildEnhanceResponse(
    request: EnhanceRequest,
    enhanced: string,
    tokensUsed: number,
    startTime: number,
  ): EnhanceResponse {
    return {
      original: request.prompt,
      enhanced,
      provider: this.provider.name,
      model: this.provider.model,
      timestamp: new Date(),
      tokensUsed,
      responseTime: Date.now() - startTime,
    };
  }

  abstract enhance(request: EnhanceRequest): Promise<EnhanceResponse>;

  abstract enhanceStream(
    request: EnhanceRequest,
    onChunk: (chunk: string) => void,
  ): Promise<EnhanceResponse>;

  abstract test(): Promise<boolean>;

  getName(): string {
    return this.provider.name;
  }

  getModel(): string {
    return this.provider.model;
  }

  isEnabled(): boolean {
    return this.provider.enabled && !!this.provider.apiKey;
  }

  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }

  setRetries(retries: number): void {
    this.retries = retries;
  }
}
