/**
 * Unicode symbols with ASCII fallbacks for better compatibility
 */
export const symbols = {
  bullet: process.env.CI || !process.stdout.isTTY ? '-' : '•',
  check: process.env.CI || !process.stdout.isTTY ? 'OK' : '✓',
  cross: process.env.CI || !process.stdout.isTTY ? 'X' : '✗',
  warning: process.env.CI || !process.stdout.isTTY ? '!' : '⚠️',
  info: process.env.CI || !process.stdout.isTTY ? 'i' : 'ℹ️',
  success: process.env.CI || !process.stdout.isTTY ? 'OK' : '✅',
  error: process.env.CI || !process.stdout.isTTY ? 'ERR' : '❌',
  test: process.env.CI || !process.stdout.isTTY ? 'TEST' : '🧪',
  config: process.env.CI || !process.stdout.isTTY ? 'CFG' : '📄',
  lightbulb: process.env.CI || !process.stdout.isTTY ? 'TIP' : '💡',
} as const;

/**
 * Check if the current environment supports Unicode
 */
export const supportsUnicode = (): boolean => {
  if (process.env.CI) return false;
  if (!process.stdout.isTTY) return false;

  const { env } = process;
  if (env.TERM === 'dumb') return false;
  if (env.TERM_PROGRAM === 'Apple_Terminal') return true;
  if (env.TERM_PROGRAM === 'vscode') return true;
  if (env.COLORTERM) return true;

  return true;
};
