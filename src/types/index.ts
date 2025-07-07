export interface Provider {
  name: string;
  apiKey: string;
  model: string;
  baseUrl: string;
  enabled: boolean;
}

export interface EnhanceRequest {
  prompt: string;
  provider?: string;
  options?: EnhanceOptions;
}

export interface EnhanceOptions {
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
  format?: 'markdown' | 'plain';
  includeOriginal?: boolean;
  verbose?: boolean;
  stream?: boolean;
  mode?: 'sm' | 'md' | 'lg';
}

export interface EnhanceResponse {
  original: string;
  enhanced: string;
  provider: string;
  model: string;
  timestamp: Date;
  tokensUsed: number;
  responseTime: number;
}

export interface Config {
  version: string;
  defaultProvider: string;
  providers: Record<string, Provider>;
  settings: Settings;
}

export interface Settings {
  maxTokens: number;
  temperature: number;
  timeout: number;
  retries: number;
  outputFormat: 'markdown' | 'plain';
  defaultMode: 'sm' | 'md' | 'lg';
}

export class ProviderError extends Error {
  provider: string;
  code?: string;
  statusCode?: number;
  retryable?: boolean;

  constructor(
    message: string,
    provider: string,
    code: string,
    retryable: false,
    statusCode?: number,
  ) {
    super(message);
    this.name = 'ProviderError';
    this.provider = provider;
    this.code = code;
    this.retryable = retryable;
    this.statusCode = statusCode;
  }
}

export interface APIResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  tokensUsed?: number;
  model?: string;
}

export interface ProviderConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
  enabled: boolean;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

export interface CommandOptions {
  provider?: string;
  file?: string;
  copy?: boolean;
  verbose?: boolean;
  output?: string;
  format?: 'markdown' | 'plain';
  stream?: boolean;
  mode?: 'sm' | 'md' | 'lg';
}

export interface ConfigSetOptions {
  provider: string;
  key?: string;
  model?: string;
  baseUrl?: string;
  enabled?: boolean;
}

export interface TestResult {
  provider: string;
  success: boolean;
  error?: string;
  responseTime: number;
  model?: string;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug(message: string, meta?: unknown): void;
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, meta?: unknown): void;
}
