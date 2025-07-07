import { configManager } from '@/utils/config.js';
import pc from 'picocolors';

export async function configCommand() {
  console.log(pc.cyan('📄 Configuration Management'));
  console.log('Available commands:');
  console.log('• promptboost config show          - Display current configuration');
  console.log('• promptboost config set           - Set configuration values');
  console.log('• promptboost config default       - Set default provider');
  console.log('• promptboost config reset         - Reset to defaults');
  console.log('\nExamples:');
  console.log('• promptboost config set --provider openai --key sk-...');
  console.log('• promptboost config default --provider anthropic');
}

export async function configShowCommand() {
  try {
    const config = await configManager.load();

    console.log(pc.cyan('📄 Current Configuration\n'));

    console.log(pc.bold('Default Provider:'), config.defaultProvider);
    console.log(pc.bold('Config Path:'), configManager.getConfigPath());
    console.log();

    console.log(pc.bold('Providers:'));
    for (const [name, provider] of Object.entries(config.providers)) {
      const status =
        provider.enabled && provider.apiKey ? pc.green('✓ Configured') : pc.red('✗ Not configured');

      console.log(`  ${name.padEnd(12)} ${status} (${provider.model})`);
    }

    console.log();
    console.log(pc.bold('Settings:'));
    console.log(`  Max Tokens:    ${config.settings.maxTokens}`);
    console.log(`  Temperature:   ${config.settings.temperature}`);
    console.log(`  Timeout:       ${config.settings.timeout}ms`);
    console.log(`  Retries:       ${config.settings.retries}`);
    console.log(`  Template:      ${config.settings.defaultTemplate}`);
    console.log(`  Format:        ${config.settings.outputFormat}`);
  } catch (error) {
    console.error(pc.red('❌ Failed to load configuration:'), error);
    process.exit(1);
  }
}

export async function configSetCommand(options: {
  provider?: string;
  key?: string;
  model?: string;
  baseUrl?: string;
  enabled?: string;
}) {
  try {
    if (!options.provider) {
      throw new Error('Provider is required. Use --provider <name>');
    }

    const updates: Record<string, unknown> = {};

    if (options.key) updates.apiKey = options.key;
    if (options.model) updates.model = options.model;
    if (options.baseUrl) updates.baseUrl = options.baseUrl;
    if (options.enabled !== undefined) {
      updates.enabled = options.enabled.toLowerCase() === 'true';
    }

    if (Object.keys(updates).length === 0) {
      throw new Error('No configuration updates provided');
    }

    await configManager.setProvider(options.provider, updates);

    console.log(pc.green('✓ Configuration updated successfully'));

    if (options.key) {
      updates.enabled = true;
      await configManager.setProvider(options.provider, { enabled: true });
      console.log(pc.gray(`  Provider ${options.provider} enabled`));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(pc.red('❌ Configuration update failed:'), errorMessage);
    process.exit(1);
  }
}

export async function configDefaultCommand(options: { provider: string }) {
  try {
    if (!options.provider) {
      throw new Error('Provider is required. Use --provider <name>');
    }

    await configManager.setDefaultProvider(options.provider);
    console.log(pc.green(`✓ Default provider set to: ${options.provider}`));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(pc.red('❌ Failed to set default provider:'), errorMessage);
    process.exit(1);
  }
}

export async function configResetCommand() {
  try {
    await configManager.reset();
    console.log(pc.green('✓ Configuration reset to defaults'));
    console.log(pc.yellow('💡 You will need to reconfigure your API keys'));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(pc.red('❌ Failed to reset configuration:'), errorMessage);
    process.exit(1);
  }
}
