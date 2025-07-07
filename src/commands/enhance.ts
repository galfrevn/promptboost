import { readFileSync, writeFileSync } from 'node:fs';
import { createProvider } from '@/providers/index.js';
import type { CommandOptions, EnhanceResponse } from '@/types/index.js';
import { configManager } from '@/utils/config.js';
import { logger } from '@/utils/logger.js';
import { symbols } from '@/utils/symbols.js';
import {
  displayValidationErrors,
  validateModelOptions,
  validateOptions,
  validatePrompt,
} from '@/utils/validation.js';
import spinners from 'cli-spinners';
import clipboard from 'clipboardy';
import pc from 'picocolors';

export async function enhanceCommand(prompt?: string, options: CommandOptions = {}) {
  let spinnerInterval: NodeJS.Timeout | undefined;

  const startSpinner = (text: string) => {
    const spinner = spinners.dots;
    let i = 0;
    process.stdout.write('\n');
    spinnerInterval = setInterval(() => {
      const { frames } = spinner;
      i = (i + 1) % frames.length;
      process.stdout.write(`\r${frames[i]} ${text}`);
    }, spinner.interval);
  };

  const stopSpinner = () => {
    if (spinnerInterval) {
      clearInterval(spinnerInterval);
      process.stdout.write('\r');
    }
  };

  try {
    if (options.verbose) {
      logger.setLevel('debug');
    }

    // Validate command options first
    const optionsValidation = validateOptions(options as Record<string, unknown>);
    if (!optionsValidation.isValid) {
      displayValidationErrors(optionsValidation.errors);
      process.exit(1);
    }

    const config = await configManager.load();

    if (!prompt && !options.file) {
      console.log(pc.red(`${symbols.cross} Please provide a prompt or use --file option`));
      console.log(pc.dim(`${symbols.info} Example: promptboost "Explain quantum computing"`));
      console.log(pc.dim(`${symbols.info} Or use: promptboost --file my-prompt.txt`));
      process.exit(1);
    }

    let inputPrompt = prompt;
    if (options.file) {
      try {
        inputPrompt = readFileSync(options.file, 'utf-8').trim();
        console.log(pc.dim(`${symbols.info} Loaded prompt from: ${options.file}`));
      } catch (error) {
        console.log(pc.red(`${symbols.cross} Failed to read file: ${options.file}`));
        if (error instanceof Error) {
          console.log(pc.dim(`${symbols.error} ${error.message}`));
        }
        process.exit(1);
      }
    }

    if (!inputPrompt) {
      console.log(pc.red(`${symbols.cross} Prompt cannot be empty`));
      console.log(pc.dim(`${symbols.info} Provide a meaningful prompt describing your request`));
      process.exit(1);
    }

    // Validate the prompt content
    const promptValidation = validatePrompt(inputPrompt);
    if (!promptValidation.isValid) {
      displayValidationErrors(promptValidation.errors);
      console.log(
        pc.dim(
          `${symbols.info} Your prompt: "${inputPrompt.substring(0, 50)}${inputPrompt.length > 50 ? '...' : ''}"`,
        ),
      );
      process.exit(1);
    }

    // Show validation success for verbose mode
    if (options.verbose) {
      console.log(pc.green(`${symbols.check} Prompt validation passed`));
      console.log(pc.dim(`${symbols.info} Prompt length: ${inputPrompt.length} characters`));
    }

    const providerName = options.provider || config.defaultProvider;
    const provider = await configManager.getProvider(providerName);

    if (!provider) {
      console.log(pc.red(`${symbols.cross} Provider not found: ${providerName}`));
      console.log(pc.dim(`${symbols.info} Available providers: openai, anthropic, grok, google`));
      process.exit(1);
    }

    // Validate model name and streaming compatibility
    const modelValidation = validateModelOptions(providerName, provider.model, !!options.stream);
    if (!modelValidation.isValid) {
      console.log(pc.red(`${symbols.cross} Model validation failed:`));
      for (const error of modelValidation.errors) {
        console.log(pc.red(`  • ${error}`));
      }
      process.exit(1);
    }

    // Show model validation warnings if any
    if (modelValidation.warnings.length > 0 && options.verbose) {
      for (const warning of modelValidation.warnings) {
        console.log(pc.yellow(`${symbols.warning} ${warning}`));
      }
    }

    if (!provider.enabled || !provider.apiKey) {
      console.log(pc.red(`${symbols.cross} Provider ${providerName} is not configured`));
      console.log();
      console.log(pc.cyan('📝 To set up a provider, choose one of these options:'));
      console.log();
      console.log(pc.dim('• OpenAI (GPT models):'));
      console.log('  promptboost config set --provider openai --key YOUR_OPENAI_API_KEY');
      console.log();
      console.log(pc.dim('• Anthropic (Claude models):'));
      console.log('  promptboost config set --provider anthropic --key YOUR_ANTHROPIC_API_KEY');
      console.log();
      console.log(pc.dim('• xAI (Grok models):'));
      console.log('  promptboost config set --provider grok --key YOUR_XAI_API_KEY');
      console.log();
      console.log(pc.dim('• Google (Gemini models):'));
      console.log('  promptboost config set --provider google --key YOUR_GOOGLE_API_KEY');
      console.log();
      console.log(
        pc.yellow(
          `${symbols.lightbulb} The first provider you configure will become your default!`,
        ),
      );
      process.exit(1);
    }

    const providerInstance = createProvider(provider);

    const enhanceRequest = {
      prompt: inputPrompt,
      provider: providerName,
      options: {
        format: options.format,
        verbose: options.verbose,
        stream: options.stream,
        mode: options.mode,
      },
    };

    let response: EnhanceResponse;

    if (options.stream) {
      console.log(pc.cyan('\n🚀 Enhancing prompt (streaming)...\n'));
      response = await providerInstance.enhanceStream(enhanceRequest, (chunk: string) => {
        process.stdout.write(chunk);
      });

      console.log('\n');

      if (options.format === 'markdown') {
        console.log(
          pc.dim(
            `\n📊 Stats: ${response.tokensUsed} tokens used | ${response.responseTime}ms response time`,
          ),
        );
        console.log(pc.dim('💡 Tip: Use --copy to copy enhanced prompt to clipboard'));
      }
    } else {
      startSpinner(pc.cyan('Enhancing prompt...'));
      response = await providerInstance.enhance(enhanceRequest);
      stopSpinner();
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
        await clipboard.write(response.enhanced);
        console.log('');
        console.log(pc.green('✓ Enhanced prompt copied to clipboard'));
      } catch (error) {
        console.error(pc.red(`Failed to copy to clipboard: ${error}`));
      }
    }
  } catch (error) {
    stopSpinner();
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(pc.red('\n❌ Error:'), errorMessage);

    if (errorMessage.includes('API key not configured')) {
      console.log(
        pc.yellow('💡 Run:'),
        `promptboost config set --provider ${options.provider || 'openai'} --key your-api-key`,
      );
    }

    process.exit(1);
  }
}
