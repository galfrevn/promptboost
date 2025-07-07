import type { EnhanceRequest, EnhanceResponse, GoogleResponse } from '@/types/index.js';
import { logger } from '@/utils/logger.js';
import { BaseProvider } from './base.js';

export class GoogleProvider extends BaseProvider {
  async enhance(request: EnhanceRequest): Promise<EnhanceResponse> {
    this.validateRequest(request);

    const startTime = Date.now();
    const url = `${this.provider.baseUrl}/v1beta/models/${this.provider.model}:generateContent?key=${this.provider.apiKey}`;

    const systemPrompt = this.buildSystemPrompt(request.options?.mode);

    const requestBody = {
      contents: [
        {
          parts: [{ text: `${systemPrompt}\n\nOriginal prompt: ${request.prompt}` }],
        },
      ],
      generationConfig: {
        maxOutputTokens: request.options?.maxTokens || 1000,
        temperature: request.options?.temperature || 0.7,
      },
    };

    logger.debug('Making Google API request', {
      model: this.provider.model,
      prompt_length: request.prompt.length,
    });

    const response = await this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const data = (await response.json()) as GoogleResponse;

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw this.createError('Invalid response from Google API');
    }

    const enhanced = data.candidates[0].content.parts[0].text.trim();
    const tokensUsed =
      data.usageMetadata?.totalTokenCount || this.countTokens(request.prompt + enhanced);

    console.log('');
    console.log('');
    logger.info('Google enhancement completed', {
      tokens_used: tokensUsed,
      response_time: Date.now() - startTime,
    });

    return this.buildEnhanceResponse(request, enhanced, tokensUsed, startTime);
  }

  private buildSystemPrompt(mode?: 'sm' | 'md' | 'lg'): string {
    const basePrompt =
      'You are a prompt optimization expert. Your task is to improve the given prompt to make it more effective, specific, and clear.';

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

  async enhanceStream(
    request: EnhanceRequest,
    onChunk: (chunk: string) => void,
  ): Promise<EnhanceResponse> {
    // Google streaming implementation would go here
    // For now, fallback to regular enhance and simulate streaming
    const response = await this.enhance(request);

    // Simulate streaming by outputting the result in chunks
    const words = response.enhanced.split(' ');
    for (let i = 0; i < words.length; i++) {
      const chunk = i === 0 ? words[i] : ` ${words[i]}`;
      if (chunk) {
        onChunk(chunk);
      }
      await this.delay(50); // Small delay to simulate streaming
    }

    return response;
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
      logger.error('Google test failed', { error });
      return false;
    }
  }
}
