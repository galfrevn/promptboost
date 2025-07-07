#!/usr/bin/env node

import { removeConfig, setConfig, showConfig } from '@/commands/config.js';
import { enhanceCommand } from '@/commands/enhance.js';
import { testCommand } from '@/commands/test.js';
import { logger } from '@/utils/logger.js';
import { symbols } from '@/utils/symbols.js';
import { Command } from 'commander';
import pc from 'picocolors';

const program = new Command();

program
  .name('promptboost')
  .description('CLI tool that enhances prompts using AI providers')
  .version('1.0.0');

program
  .argument('[prompt]', 'The prompt to enhance')
  .option('-p, --provider <provider>', 'AI provider to use')
  .option('-f, --file <file>', 'Read prompt from file')
  .option('-c, --copy', 'Copy enhanced prompt to clipboard')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('-o, --output <file>', 'Save enhanced prompt to file')
  .option('--format <format>', 'Output format (plain|markdown)', 'plain')
  .option('-s, --stream', 'Stream the response in real-time')
  .option('-m, --mode <mode>', 'Enhancement mode (sm|md|lg)', 'md')
  .action(enhanceCommand);

const config = program.command('config').description('Manage configuration');

config.command('show').description('Display current configuration').action(showConfig);

config
  .command('set')
  .description('Set configuration values')
  .option('--provider <name>', 'Provider name')
  .option('--key <key>', 'API key')
  .option('--model <model>', 'Model name')
  .option('--default <name>', 'Set default provider')
  .action((options) => {
    const allOptions = { ...program.opts(), ...options };
    setConfig(allOptions);
  });

config
  .command('remove')
  .description('Remove provider configuration')
  .option('--provider <name>', 'Provider name to remove')
  .action((options) => {
    const allOptions = { ...program.opts(), ...options };
    removeConfig(allOptions);
  });

program
  .command('test')
  .description('Test provider connectivity')
  .option('-p, --provider <provider>', 'Test specific provider')
  .action(testCommand);

program
  .command('providers')
  .description('List available providers')
  .action(() => {
    console.log(pc.cyan('Available providers:'));
    console.log(`${symbols.bullet} openai    - OpenAI GPT models`);
    console.log(`${symbols.bullet} anthropic - Anthropic Claude models`);
    console.log(`${symbols.bullet} grok      - xAI Grok models`);
    console.log(`${symbols.bullet} google    - Google Gemini models`);
  });

program.parseAsync(process.argv).catch((error) => {
  logger.error('Command failed', { error });
  process.exit(1);
});
