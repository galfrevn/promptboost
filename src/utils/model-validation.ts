/**
 * Model validation utilities for AI provider models and streaming support
 * Based on AI SDK documentation for OpenAI, Anthropic, Google, and xAI providers
 */

export interface ModelCapabilities {
  streaming: boolean;
}

// Model definitions based on AI SDK documentation
export const PROVIDER_MODELS = {
  openai: {
    // Chat models - all support streaming
    'gpt-4.1': { streaming: true },
    'gpt-4.1-mini': { streaming: true },
    'gpt-4.1-nano': { streaming: true },
    'gpt-4o': { streaming: true },
    'gpt-4o-mini': { streaming: true },
    'gpt-4o-audio-preview': { streaming: true },
    'gpt-4-turbo': { streaming: true },
    'gpt-4': { streaming: true },
    'gpt-3.5-turbo': { streaming: true },
    'chatgpt-4o-latest': { streaming: true },

    // Reasoning models - all support streaming
    o1: { streaming: true },
    'o1-mini': { streaming: true },
    'o1-preview': { streaming: true },
    'o3-mini': { streaming: true },
    o3: { streaming: true },
    'o4-mini': { streaming: true },

    // Completion models - support streaming
    'gpt-3.5-turbo-instruct': { streaming: true },
  },

  anthropic: {
    // Claude 4 models - all support streaming
    'claude-4-opus-20250514': { streaming: true },
    'claude-4-sonnet-20250514': { streaming: true },

    // Claude 3.7 models - all support streaming
    'claude-3-7-sonnet-20250219': { streaming: true },

    // Claude 3.5 models - all support streaming
    'claude-3-5-sonnet-20241022': { streaming: true },
    'claude-3-5-sonnet-20240620': { streaming: true },
    'claude-3-5-haiku-20241022': { streaming: true },

    // Claude 3 models - all support streaming
    'claude-3-opus-20240229': { streaming: true },
    'claude-3-sonnet-20240229': { streaming: true },
    'claude-3-haiku-20240307': { streaming: true },
  },

  google: {
    // Gemini 2.5 models - all support streaming
    'gemini-2.5-pro': { streaming: true },
    'gemini-2.5-flash': { streaming: true },
    'gemini-2.5-pro-preview-05-06': { streaming: true },
    'gemini-2.5-flash-preview-04-17': { streaming: true },
    'gemini-2.5-pro-exp-03-25': { streaming: true },

    // Gemini 2.0 models - all support streaming
    'gemini-2.0-flash': { streaming: true },
    'gemini-2.0-flash-exp': { streaming: true },

    // Gemini 1.5 models - all support streaming
    'gemini-1.5-pro': { streaming: true },
    'gemini-1.5-pro-latest': { streaming: true },
    'gemini-1.5-flash': { streaming: true },
    'gemini-1.5-flash-latest': { streaming: true },
    'gemini-1.5-flash-8b': { streaming: true },
    'gemini-1.5-flash-8b-latest': { streaming: true },
  },

  grok: {
    // Grok 3 models - all support streaming
    'grok-3': { streaming: true },
    'grok-3-fast': { streaming: true },
    'grok-3-mini': { streaming: true },
    'grok-3-mini-fast': { streaming: true },

    // Grok 2 models - all support streaming
    'grok-2-1212': { streaming: true },
    'grok-2-vision-1212': { streaming: true },

    // Beta models - all support streaming
    'grok-beta': { streaming: true },
    'grok-vision-beta': { streaming: true },
  },
} as const;

export type ProviderName = keyof typeof PROVIDER_MODELS;
export type ModelName<T extends ProviderName> = keyof (typeof PROVIDER_MODELS)[T];

/**
 * Validates if a model name is valid for the given provider
 */
export function isValidModel(provider: string, model: string): boolean {
  const providerModels = PROVIDER_MODELS[provider as ProviderName];
  if (!providerModels) {
    return false;
  }

  return model in providerModels;
}

/**
 * Validates if a model supports streaming for the given provider
 */
export function supportsStreaming(provider: string, model: string): boolean {
  const providerModels = PROVIDER_MODELS[provider as ProviderName];
  if (!providerModels) {
    return false;
  }

  const modelInfo = providerModels[model as keyof typeof providerModels] as
    | ModelCapabilities
    | undefined;
  return modelInfo?.streaming ?? false;
}

/**
 * Gets the capabilities of a specific model
 */
export function getModelCapabilities(provider: string, model: string): ModelCapabilities | null {
  const providerModels = PROVIDER_MODELS[provider as ProviderName];
  if (!providerModels) {
    return null;
  }

  return providerModels[model as keyof typeof providerModels] || null;
}

/**
 * Gets all valid models for a provider
 */
export function getValidModels(provider: string): string[] {
  const providerModels = PROVIDER_MODELS[provider as ProviderName];
  if (!providerModels) {
    return [];
  }

  return Object.keys(providerModels);
}

/**
 * Gets all models that support streaming for a provider
 */
export function getStreamingModels(provider: string): string[] {
  const providerModels = PROVIDER_MODELS[provider as ProviderName];
  if (!providerModels) {
    return [];
  }

  return Object.entries(providerModels)
    .filter(([_, capabilities]) => capabilities.streaming)
    .map(([model, _]) => model);
}

/**
 * Validates model and streaming compatibility
 */
export interface ModelValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateModelAndStreaming(
  provider: string,
  model: string,
  useStreaming = false,
): ModelValidationResult {
  const result: ModelValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  // Check if provider is supported
  if (!(provider in PROVIDER_MODELS)) {
    result.isValid = false;
    result.errors.push(
      `Provider '${provider}' is not supported. Supported providers: ${Object.keys(PROVIDER_MODELS).join(', ')}`,
    );
    return result;
  }

  // Check if model is valid for the provider
  if (!isValidModel(provider, model)) {
    result.isValid = false;
    const validModels = getValidModels(provider);
    result.errors.push(`Model '${model}' is not valid for provider '${provider}'.`);
    result.errors.push(`Valid models for ${provider}: ${validModels.join(', ')}`);
    return result;
  }

  // Check streaming compatibility if streaming is enabled
  if (useStreaming && !supportsStreaming(provider, model)) {
    result.isValid = false;
    const streamingModels = getStreamingModels(provider);
    result.errors.push(`Model '${model}' does not support streaming.`);
    if (streamingModels.length > 0) {
      result.errors.push(
        `Models that support streaming for ${provider}: ${streamingModels.join(', ')}`,
      );
    }
  }

  // Add informational warnings for special model types
  const capabilities = getModelCapabilities(provider, model);
  if (capabilities) {
    if (
      provider === 'openai' &&
      (model.startsWith('o1') || model.startsWith('o3') || model.startsWith('o4'))
    ) {
      result.warnings.push(` Note: ${model} is a reasoning model with longer response times.`);
    }
  }

  return result;
}

/**
 * Get the default/recommended model for a provider
 */
export function getDefaultModel(provider: string): string | null {
  const defaults: Record<string, string> = {
    openai: 'gpt-4o-mini',
    anthropic: 'claude-3-5-sonnet-20241022',
    google: 'gemini-1.5-flash',
    grok: 'grok-beta',
  };

  return defaults[provider] || null;
}

/**
 * Updates a model name to a recommended alternative if it's deprecated/invalid
 */
export function getRecommendedModel(provider: string, model: string): string | null {
  // Handle common deprecated or incorrect model names
  const recommendations: Record<string, Record<string, string>> = {
    openai: {
      'gpt-3.5-turbo-16k': 'gpt-3.5-turbo',
      'gpt-4-32k': 'gpt-4-turbo',
      'gpt-4-0613': 'gpt-4',
      'gpt-4-turbo-preview': 'gpt-4-turbo',
    },
    anthropic: {
      'claude-3-sonnet': 'claude-3-5-sonnet-20241022',
      'claude-3-haiku': 'claude-3-5-haiku-20241022',
      'claude-3-opus': 'claude-3-opus-20240229',
    },
    google: {
      'gemini-pro': 'gemini-1.5-pro',
      'gemini-pro-vision': 'gemini-1.5-pro',
      'gemini-1.0-pro': 'gemini-1.5-pro',
    },
    grok: {
      'grok-1': 'grok-beta',
      'grok-2': 'grok-2-1212',
    },
  };

  const providerRecommendations = recommendations[provider];
  if (providerRecommendations && model in providerRecommendations) {
    return providerRecommendations[model] || null;
  }

  // If model is already valid, return null (no recommendation needed)
  if (isValidModel(provider, model)) {
    return null;
  }

  // If invalid, suggest the default model
  return getDefaultModel(provider);
}
