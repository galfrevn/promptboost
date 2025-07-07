import { readFileSync, writeFileSync } from 'node:fs';
import type { CommandOptions } from '@/types/index.js';
import { configManager } from '@/utils/config.js';
import { logger } from '@/utils/logger.js';
import { ProviderFactory } from '@/providers/index.js';
import pc from 'picocolors';

export async function enhanceCommand(prompt?: string, options: CommandOptions = {}) {
  try {
    if (options.verbose) {
      logger.setLevel('debug');
    }

    const config = await configManager.load();

    if (!prompt && !options.file) {
      throw new Error('Please provide a prompt or use --file option');
    }

    let inputPrompt = prompt;
    if (options.file) {
      try {
        inputPrompt = readFileSync(options.file, 'utf-8').trim();
      } catch (error) {
        throw new Error(`Failed to read file: ${options.file}`);
      }
    }

    if (!inputPrompt) {
      throw new Error('Prompt cannot be empty');
    }

    const providerName = options.provider || config.defaultProvider;
    const provider = await configManager.getProvider(providerName);

    if (!provider) {
      throw new Error(`Provider not found: ${providerName}`);
    }

    if (!provider.enabled || !provider.apiKey) {
      throw new Error(
        `Provider ${providerName} is not configured. Run: promptboost config set --provider ${providerName} --key your-api-key`,
      );
    }

    console.log(pc.cyan('🚀 Enhancing prompt...'));
    console.log(pc.gray(`✓ Using ${provider.name} (${provider.model})`));

    const providerInstance = ProviderFactory.create(provider);

    const enhanceRequest = {
      prompt: inputPrompt,
      provider: providerName,
      template: options.template,
      options: {
        format: options.format,
        verbose: options.verbose,
      },
    };

    const response = await providerInstance.enhance(enhanceRequest);

    console.log(pc.green('✓ Enhanced prompt ready!\n'));

    if (options.format === 'plain') {
      console.log(response.enhanced);
    } else {
      console.log(pc.bold('📝 Original:'));
      console.log(pc.gray(`"${response.original}"\n`));

      console.log(pc.bold('✨ Enhanced:'));
      console.log(`"${response.enhanced}"\n`);

      console.log(
        pc.dim(
          `📊 Stats: ${response.tokensUsed} tokens used | ${response.responseTime}ms response time`,
        ),
      );
      console.log(pc.dim('💡 Tip: Use --copy to copy enhanced prompt to clipboard'));
    }

    if (options.output) {
      try {
        writeFileSync(options.output, response.enhanced, 'utf-8');
        console.log(pc.green(`✓ Enhanced prompt saved to ${options.output}`));
      } catch (error) {
        console.error(pc.red(`Failed to save to file: ${error}`));
      }
    }

    if (options.copy) {
      try {
        // Note: Clipboard functionality would need a library like 'clipboardy'
        console.log(pc.yellow('📋 Clipboard functionality not implemented yet'));
      } catch (error) {
        console.error(pc.red(`Failed to copy to clipboard: ${error}`));
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(pc.red('❌ Error:'), errorMessage);

    if (errorMessage.includes('API key not configured')) {
      console.log(
        pc.yellow('💡 Run:'),
        `promptboost config set --provider ${options.provider || 'openai'} --key your-api-key`,
      );
    }

    process.exit(1);
  }
}
