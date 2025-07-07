import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { Config, Provider } from '@/types/index.js';
import { logger } from '@/utils/logger.js';

export class ConfigManager {
  private configDir: string;
  private configPath: string;
  private config: Config | null = null;

  constructor() {
    this.configDir = join(homedir(), '.promptboost');
    this.configPath = join(this.configDir, 'config.json');
  }

  private getDefaultConfig(): Config {
    return {
      version: '1.0.0',
      defaultProvider: 'openai',
      providers: {
        openai: {
          name: 'openai',
          apiKey: '',
          model: 'gpt-4.1-mini',
          baseUrl: 'https://api.openai.com/v1',
          enabled: false,
        },
        anthropic: {
          name: 'anthropic',
          apiKey: '',
          model: 'claude-4-sonnet',
          baseUrl: 'https://api.anthropic.com',
          enabled: false,
        },
        grok: {
          name: 'grok',
          apiKey: '',
          model: 'grok-3',
          baseUrl: 'https://api.x.ai/v1',
          enabled: false,
        },
        google: {
          name: 'google',
          apiKey: '',
          model: 'gemini-2.5-flash',
          baseUrl: 'https://generativelanguage.googleapis.com',
          enabled: false,
        },
      },
      settings: {
        maxTokens: 1000,
        temperature: 0.7,
        timeout: 30000,
        retries: 3,
        outputFormat: 'plain',
        defaultMode: 'md',
      },
    };
  }

  private ensureConfigDir(): void {
    if (!existsSync(this.configDir)) {
      mkdirSync(this.configDir, { recursive: true });
      logger.debug(`Created config directory: ${this.configDir}`);
    }
  }

  private validateConfig(config: unknown): Config {
    const defaultConfig = this.getDefaultConfig();

    if (!config || typeof config !== 'object') {
      throw new Error('Invalid configuration format');
    }

    const typedConfig = config as Record<string, unknown>;

    return {
      version: (typedConfig.version as string) || defaultConfig.version,
      defaultProvider: (typedConfig.defaultProvider as string) || defaultConfig.defaultProvider,
      providers: {
        ...defaultConfig.providers,
        ...(typedConfig.providers as Record<string, Provider>),
      },
      settings: { ...defaultConfig.settings, ...(typedConfig.settings as Record<string, unknown>) },
    };
  }

  private loadFromEnvironment(): Partial<Config> {
    const envConfig: Partial<Config> = {};

    if (process.env.PROMPTBOOST_OPENAI_KEY) {
      envConfig.providers = {
        ...envConfig.providers,
        openai: {
          ...this.getDefaultConfig().providers.openai,
          apiKey: process.env.PROMPTBOOST_OPENAI_KEY,
          enabled: true,
        } as Provider,
      };
    }

    if (process.env.PROMPTBOOST_ANTHROPIC_KEY) {
      envConfig.providers = {
        ...envConfig.providers,
        anthropic: {
          ...this.getDefaultConfig().providers.anthropic,
          apiKey: process.env.PROMPTBOOST_ANTHROPIC_KEY,
          enabled: true,
        } as Provider,
      };
    }

    if (process.env.PROMPTBOOST_GROK_KEY) {
      envConfig.providers = {
        ...envConfig.providers,
        grok: {
          ...this.getDefaultConfig().providers.grok,
          apiKey: process.env.PROMPTBOOST_GROK_KEY,
          enabled: true,
        } as Provider,
      };
    }

    if (process.env.PROMPTBOOST_GOOGLE_KEY) {
      envConfig.providers = {
        ...envConfig.providers,
        google: {
          ...this.getDefaultConfig().providers.google,
          apiKey: process.env.PROMPTBOOST_GOOGLE_KEY,
          enabled: true,
        } as Provider,
      };
    }

    if (process.env.PROMPTBOOST_DEFAULT_PROVIDER) {
      envConfig.defaultProvider = process.env.PROMPTBOOST_DEFAULT_PROVIDER;
    }

    return envConfig;
  }

  async load(): Promise<Config> {
    if (this.config) {
      return this.config;
    }

    let fileConfig = this.getDefaultConfig();

    this.ensureConfigDir();

    if (existsSync(this.configPath)) {
      try {
        const configContent = readFileSync(this.configPath, 'utf-8');
        const parsedConfig = JSON.parse(configContent);
        fileConfig = this.validateConfig(parsedConfig);
        logger.debug('Loaded configuration from file');
      } catch (error) {
        logger.warn(`Failed to load config file: ${error}`);
        logger.info('Using default configuration');
      }
    } else {
      await this.save(fileConfig);
      logger.info('Created default configuration file');
    }

    const envConfig = this.loadFromEnvironment();
    this.config = { ...fileConfig, ...envConfig };

    return this.config;
  }

  async save(config: Config): Promise<void> {
    this.ensureConfigDir();

    try {
      const configContent = JSON.stringify(config, null, 2);
      writeFileSync(this.configPath, configContent, 'utf-8');
      chmodSync(this.configPath, 0o600);
      this.config = config;
      logger.debug('Configuration saved successfully');
    } catch (error) {
      logger.error(`Failed to save configuration: ${error}`);
      throw new Error('Failed to save configuration');
    }
  }

  async setProvider(providerName: string, providerConfig: Partial<Provider>): Promise<void> {
    const config = await this.load();

    if (!config.providers[providerName]) {
      throw new Error(`Unknown provider: ${providerName}`);
    }

    config.providers[providerName] = {
      ...config.providers[providerName],
      ...providerConfig,
    };

    await this.save(config);
  }

  async getProvider(providerName: string): Promise<Provider | null> {
    const config = await this.load();
    return config.providers[providerName] || null;
  }

  async setDefaultProvider(providerName: string): Promise<void> {
    const config = await this.load();

    if (!config.providers[providerName]) {
      throw new Error(`Unknown provider: ${providerName}`);
    }

    config.defaultProvider = providerName;
    await this.save(config);
  }

  async getEnabledProviders(): Promise<Provider[]> {
    const config = await this.load();
    return Object.values(config.providers).filter(
      (provider) => provider.enabled && provider.apiKey,
    );
  }

  async reset(): Promise<void> {
    const defaultConfig = this.getDefaultConfig();
    await this.save(defaultConfig);
    logger.info('Configuration reset to defaults');
  }

  getConfigPath(): string {
    return this.configPath;
  }
}

export const configManager = new ConfigManager();
