#!/usr/bin/env bun

import { Command } from 'commander';
import { enhanceCommand } from '@/commands/enhance.js';
import { configCommand } from '@/commands/config.js';
import { testCommand } from '@/commands/test.js';
import { logger } from '@/utils/logger.js';
import pc from 'picocolors';

const program = new Command();

program
  .name('promptboost')
  .description('CLI tool that enhances prompts using AI providers')
  .version('1.0.0');

program
  .argument('[prompt]', 'The prompt to enhance')
  .option('-p, --provider <provider>', 'AI provider to use')
  .option('-t, --template <template>', 'Template to apply')
  .option('-f, --file <file>', 'Read prompt from file')
  .option('-c, --copy', 'Copy enhanced prompt to clipboard')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('-i, --interactive', 'Interactive mode')
  .option('-o, --output <file>', 'Save enhanced prompt to file')
  .option('--format <format>', 'Output format (markdown|plain)', 'markdown')
  .action(enhanceCommand);

program.command('config').description('Manage configuration').action(configCommand);

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
    console.log('• openai    - OpenAI GPT models');
    console.log('• anthropic - Anthropic Claude models');
    console.log('• grok      - xAI Grok models');
    console.log('• google    - Google Gemini models');
  });

program.parseAsync(process.argv).catch((error) => {
  logger.error('Command failed', { error });
  process.exit(1);
});
