export { BaseProvider } from './base.js';
export { OpenAIProvider } from './openai.js';
export { AnthropicProvider } from './anthropic.js';
export { GrokProvider } from './grok.js';
export { GoogleProvider } from './google.js';

import type { Provider } from '@/types/index.js';
import { OpenAIProvider } from './openai.js';
import { AnthropicProvider } from './anthropic.js';
import { GrokProvider } from './grok.js';
import { GoogleProvider } from './google.js';

export class ProviderFactory {
  static create(provider: Provider) {
    switch (provider.name) {
      case 'openai':
        return new OpenAIProvider(provider);
      case 'anthropic':
        return new AnthropicProvider(provider);
      case 'grok':
        return new GrokProvider(provider);
      case 'google':
        return new GoogleProvider(provider);
      default:
        throw new Error(`Unknown provider: ${provider.name}`);
    }
  }
}
