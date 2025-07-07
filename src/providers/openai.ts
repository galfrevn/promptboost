import { BaseProvider } from './base.js';
import type { EnhanceRequest, EnhanceResponse } from '@/types/index.js';
import { logger } from '@/utils/logger.js';

export class OpenAIProvider extends BaseProvider {
  async enhance(request: EnhanceRequest): Promise<EnhanceResponse> {
    this.validateRequest(request);

    const startTime = Date.now();
    const url = `${this.provider.baseUrl}/chat/completions`;

    const systemPrompt = this.buildSystemPrompt(request.options?.mode);

    const requestBody = {
      model: this.provider.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: request.prompt },
      ],
      max_tokens: request.options?.maxTokens || 1000,
      temperature: request.options?.temperature || 0.7,
    };

    logger.debug('Making OpenAI API request', {
      model: this.provider.model,
      prompt_length: request.prompt.length,
    });

    const response = await this.makeRequest(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.provider.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json() as any;

    if (!data.choices || !data.choices[0]?.message?.content) {
      throw this.createError('Invalid response from OpenAI API');
    }

    const enhanced = data.choices[0].message.content.trim();
    const tokensUsed = data.usage?.total_tokens || this.countTokens(request.prompt + enhanced);

    console.log("")
    console.log("")
    logger.info('OpenAI enhancement completed', {
      tokens_used: tokensUsed,
      response_time: Date.now() - startTime,
    });

    return this.buildEnhanceResponse(request, enhanced, tokensUsed, startTime);
  }

  private buildSystemPrompt(mode?: 'sm' | 'md' | 'lg'): string {
    const basePrompt = 'You are a prompt optimization expert. Your task is to improve the given prompt to make it more effective, specific, and clear.';
    
    switch (mode) {
      case 'sm':
        return `${basePrompt} Provide a quick, simple enhancement with 1-2 key improvements. Keep it concise and focused. Return only the enhanced prompt without any additional explanation.`;
      case 'lg':
        return `${basePrompt} Provide a comprehensive, detailed enhancement with extensive context, examples, output format specifications, and professional-level detail. Make it thorough and complete. Return only the enhanced prompt without any additional explanation.`;
      default:
        return `${basePrompt} Follow these guidelines:
1. Make the prompt more specific and detailed
2. Add context when necessary
3. Include expected output format
4. Add examples if helpful
5. Remove ambiguity
6. Optimize for AI systems

Return only the enhanced prompt without any additional explanation.`;
    }
  }

  async enhanceStream(request: EnhanceRequest, onChunk: (chunk: string) => void): Promise<EnhanceResponse> {
    this.validateRequest(request);
    
    const startTime = Date.now();
    const url = `${this.provider.baseUrl}/chat/completions`;
    
    const systemPrompt = this.buildSystemPrompt(request.options?.mode);

    const requestBody = {
      model: this.provider.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: request.prompt }
      ],
      max_tokens: request.options?.maxTokens || 1000,
      temperature: request.options?.temperature || 0.7,
      stream: true,
    };

    logger.debug('Making OpenAI streaming API request', { 
      model: this.provider.model,
      prompt_length: request.prompt.length 
    });

    const response = await this.makeRequest(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.provider.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    const enhanced = await this.handleStreamResponse(response, onChunk);
    const tokensUsed = this.countTokens(request.prompt + enhanced);

    console.log("")
    console.log("")
    logger.info('OpenAI streaming enhancement completed', {
      tokens_used: tokensUsed,
      response_time: Date.now() - startTime
    });

    return this.buildEnhanceResponse(request, enhanced, tokensUsed, startTime);
  }

  protected override extractContentFromStreamChunk(chunk: unknown): string {
    const data = chunk as any;
    return data?.choices?.[0]?.delta?.content || '';
  }

  async test(): Promise<boolean> {
    try {
      const testRequest: EnhanceRequest = {
        prompt: 'Test prompt',
        options: { maxTokens: 10 },
      };

      await this.enhance(testRequest);
      return true;
    } catch (error) {
      logger.error('OpenAI test failed', { error });
      return false;
    }
  }
}
