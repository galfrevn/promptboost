import { configManager } from '@/utils/config';
import { symbols } from '@/utils/symbols.js';
import pc from 'picocolors';

export async function showConfig() {
  try {
    const config = await configManager.load();
    console.log(pc.cyan(`${symbols.config} Current Configuration\n`));
    console.log(pc.bold('Default Provider:'), config.defaultProvider);
    console.log(pc.bold('Config Path:'), configManager.getConfigPath());
    console.log();
    console.log(pc.bold('Providers:'));
    for (const [name, provider] of Object.entries(config.providers)) {
      const status =
        provider.enabled && provider.apiKey
          ? pc.green(`${symbols.check} Configured`)
          : pc.red(`${symbols.cross} Not configured`);
      console.log(`  ${name.padEnd(12)} ${status} (${provider.model})`);
    }
  } catch (error) {
    console.error(pc.red(`${symbols.error} Failed to load configuration:`), error);
    process.exit(1);
  }
}

export async function setConfig(options: {
  provider?: string;
  key?: string;
  model?: string;
  default?: string;
}) {
  try {
    // Case 1: Set default provider
    if (options.default) {
      await configManager.setDefaultProvider(options.default);
      console.log(pc.green(`${symbols.check} Default provider set to: ${options.default}`));
    }
    // Case 2: Set provider-specific config (key or model)
    else if (options.provider && (options.key || options.model)) {
      const config = await configManager.load();
      const updates: { apiKey?: string; model?: string; enabled?: boolean } = {};
      let isFirstProvider = false;

      if (options.key) {
        updates.apiKey = options.key;
        updates.enabled = true; // Also enable provider when setting a key

        // Check if this is the first provider being configured
        const enabledProviders = Object.values(config.providers).filter(
          (p) => p.enabled && p.apiKey,
        );
        isFirstProvider = enabledProviders.length === 0;
      }
      if (options.model) {
        updates.model = options.model;
      }

      await configManager.setProvider(options.provider, updates);

      // If this is the first provider with an API key, make it the default
      if (isFirstProvider && options.key) {
        await configManager.setDefaultProvider(options.provider);
        console.log(
          pc.green(`${symbols.check} ${options.provider} configured and set as default provider`),
        );
      } else {
        console.log(
          pc.green(`${symbols.check} Configuration updated for provider: ${options.provider}`),
        );
      }

      if (updates.enabled) {
        console.log(pc.gray(`  Provider ${options.provider} enabled.`));
      }
    }
    // Case 3: Invalid combination of flags
    else {
      if (options.provider) {
        console.log(
          pc.yellow(
            'No action taken. When using --provider, you must also specify --key or --model.',
          ),
        );
      } else {
        console.log(
          pc.yellow(
            'No action taken. Use --default <provider> or --provider <name> with --key or --model.',
          ),
        );
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(pc.red(`${symbols.error} Configuration update failed:`), errorMessage);
    process.exit(1);
  }
}

export async function removeConfig(options: { provider: string }) {
  try {
    if (!options.provider) {
      throw new Error('Provider name is required. Use --provider <name>');
    }
    await configManager.setProvider(options.provider, {
      apiKey: '',
      enabled: false,
    });
    console.log(pc.green(`${symbols.check} Provider '${options.provider}' configuration removed.`));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      pc.red(`${symbols.error} Failed to remove provider configuration:`),
      errorMessage,
    );
    process.exit(1);
  }
}
