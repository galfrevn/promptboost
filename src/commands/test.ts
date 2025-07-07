import { createProvider } from '@/providers/index.js';
import type { Provider, TestResult } from '@/types/index.js';
import { configManager } from '@/utils/config.js';
import { symbols } from '@/utils/symbols.js';
import pc from 'picocolors';

export async function testCommand(options: { provider?: string } = {}) {
  try {
    const config = await configManager.load();

    if (options.provider) {
      await testSingleProvider(options.provider);
    } else {
      await testAllProviders();
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(pc.red(`${symbols.error} Test failed:`), errorMessage);
    process.exit(1);
  }
}

async function testSingleProvider(providerName: string) {
  console.log(pc.cyan(`${symbols.test} Testing provider: ${providerName}\n`));

  const provider = await configManager.getProvider(providerName);

  if (!provider) {
    console.error(pc.red(`${symbols.error} Provider not found: ${providerName}`));
    return;
  }

  if (!provider.enabled || !provider.apiKey) {
    console.error(pc.red(`${symbols.error} Provider ${providerName} is not configured`));
    console.log(
      pc.yellow(`${symbols.lightbulb} Run:`),
      `promptboost config set --provider ${providerName} --key your-api-key`,
    );
    return;
  }

  const result = await runProviderTest(provider);
  displayTestResult(result);
}

async function testAllProviders() {
  console.log(pc.cyan(`${symbols.test} Testing all configured providers\n`));

  const enabledProviders = await configManager.getEnabledProviders();

  if (enabledProviders.length === 0) {
    console.log(pc.yellow(`${symbols.warning} No providers are configured`));
    console.log(pc.gray('Configure a provider first:'));
    console.log(pc.gray('  promptboost config set --provider openai --key your-api-key'));
    return;
  }

  const results: TestResult[] = [];

  for (const provider of enabledProviders) {
    process.stdout.write(pc.gray(`Testing ${provider.name}... `));

    const result = await runProviderTest(provider);
    results.push(result);

    if (result.success) {
      console.log(pc.green('✓'));
    } else {
      console.log(pc.red('✗'));
    }
  }

  console.log(`\n${pc.bold('Test Results:')}`);
  results.forEach(displayTestResult);

  const successCount = results.filter((r) => r.success).length;
  const summary = `${successCount}/${results.length} providers working`;

  if (successCount === results.length) {
    console.log(pc.green(`\n✓ All tests passed! (${summary})`));
  } else {
    console.log(pc.yellow(`\n⚠️  Some tests failed (${summary})`));
  }
}

async function runProviderTest(provider: Provider): Promise<TestResult> {
  const startTime = Date.now();

  try {
    const providerInstance = createProvider(provider);
    const success = await providerInstance.test();

    return {
      provider: provider.name,
      success,
      responseTime: Date.now() - startTime,
      model: provider.model,
    };
  } catch (error) {
    return {
      provider: provider.name,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      responseTime: Date.now() - startTime,
    };
  }
}

function displayTestResult(result: TestResult) {
  const status = result.success ? pc.green('✓ Working') : pc.red('✗ Failed');

  const timing = pc.gray(`${result.responseTime}ms`);
  const model = result.model ? pc.gray(`(${result.model})`) : '';

  console.log(`  ${result.provider.padEnd(12)} ${status} ${timing} ${model}`);

  if (!result.success && result.error) {
    console.log(pc.red(`    Error: ${result.error}`));
  }
}
