import { BaseProvider } from './base.js';
import type { EnhanceRequest, EnhanceResponse } from '@/types/index.js';
import { logger } from '@/utils/logger.js';

export class AnthropicProvider extends BaseProvider {
  async enhance(request: EnhanceRequest): Promise<EnhanceResponse> {
    this.validateRequest(request);

    const startTime = Date.now();
    const url = `${this.provider.baseUrl}/v1/messages`;

    const systemPrompt = `You are a prompt optimization expert. Your task is to improve the given prompt to make it more effective, specific, and clear. Follow these guidelines:
1. Make the prompt more specific and detailed
2. Add context when necessary
3. Include expected output format
4. Add examples if helpful
5. Remove ambiguity
6. Optimize for AI systems

Return only the enhanced prompt without any additional explanation.`;

    const requestBody = {
      model: this.provider.model,
      max_tokens: request.options?.maxTokens || 1000,
      temperature: request.options?.temperature || 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: request.prompt }],
    };

    logger.debug('Making Anthropic API request', {
      model: this.provider.model,
      prompt_length: request.prompt.length,
    });

    const response = await this.makeRequest(url, {
      method: 'POST',
      headers: {
        'x-api-key': this.provider.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!data.content || !data.content[0]?.text) {
      throw this.createError('Invalid response from Anthropic API');
    }

    const enhanced = data.content[0].text.trim();
    const tokensUsed = data.usage?.output_tokens || this.countTokens(enhanced);

    logger.info('Anthropic enhancement completed', {
      tokens_used: tokensUsed,
      response_time: Date.now() - startTime,
    });

    return this.buildEnhanceResponse(request, enhanced, tokensUsed, startTime);
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
      logger.error('Anthropic test failed', { error });
      return false;
    }
  }
}
