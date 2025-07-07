import pc from 'picocolors';
import {
  type ModelValidationResult,
  getRecommendedModel,
  isValidModel,
  validateModelAndStreaming,
} from './model-validation.js';
import { symbols } from './symbols.js';

export interface ValidationError {
  field: string;
  message: string;
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates a prompt string according to various criteria
 */
export function validatePrompt(prompt: string): ValidationResult {
  const errors: ValidationError[] = [];

  // 1. Minimum length validation (8 characters)
  if (prompt.length < 8) {
    errors.push({
      field: 'length',
      message: 'Prompt must be at least 8 characters long',
      suggestion: 'Add more detail to describe what you want the AI to help with',
    });
  }

  // 2. Maximum length validation (avoid extremely long prompts)
  if (prompt.length > 1000) {
    errors.push({
      field: 'length',
      message: 'Prompt is too long (maximum 50,000 characters)',
      suggestion: 'Consider breaking your request into smaller parts or using a file input',
    });
  }

  // 3. Check for only whitespace
  if (prompt.trim().length === 0) {
    errors.push({
      field: 'content',
      message: 'Prompt cannot be empty or contain only whitespace',
      suggestion: 'Provide a meaningful prompt describing your request',
    });
  }

  // 4. Check for very short words (likely not meaningful)
  const words = prompt.trim().split(/\s+/);
  if (words.length === 1 && words[0] && words[0].length < 3) {
    errors.push({
      field: 'content',
      message: 'Single very short words are not meaningful prompts',
      suggestion: 'Describe what you want in more detail',
    });
  }

  // 5. Check for repetitive content (same word repeated)
  if (words.length > 1) {
    const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
    if (uniqueWords.size === 1) {
      errors.push({
        field: 'content',
        message: 'Prompt appears to be repetitive (same word repeated)',
        suggestion: 'Provide a varied description of what you need',
      });
    }
  }

  // 6. Check for potentially harmful content patterns
  const harmfulPatterns = [
    /(?:^|\s)(hack|exploit|bypass|crack|jailbreak)(?:\s|$)/i,
    /(?:^|\s)(illegal|terrorism|violence|harm)(?:\s|$)/i,
  ];

  for (const pattern of harmfulPatterns) {
    if (pattern.test(prompt)) {
      errors.push({
        field: 'content',
        message: 'Prompt may contain inappropriate content',
        suggestion: 'Please rephrase your request in a constructive way',
      });
      break; // Only show one harmful content warning
    }
  }

  // 7. Check for excessive special characters or symbols
  const specialCharRatio = (prompt.match(/[^a-zA-Z0-9\s.,!?'"()-]/g) || []).length / prompt.length;
  if (specialCharRatio > 0.3) {
    errors.push({
      field: 'content',
      message: 'Prompt contains too many special characters',
      suggestion: 'Use plain text with standard punctuation for better AI understanding',
    });
  }

  // 8. Check for binary or encoded content
  if (/^[01\s]+$/.test(prompt.trim()) && prompt.length > 20) {
    errors.push({
      field: 'content',
      message: 'Prompt appears to be binary data',
      suggestion: 'Please provide a text-based prompt describing your request',
    });
  }

  // 9. Check for base64-like content
  if (/^[A-Za-z0-9+/=\s]+$/.test(prompt.trim()) && prompt.length > 50 && prompt.includes('=')) {
    errors.push({
      field: 'content',
      message: 'Prompt appears to be encoded data',
      suggestion: 'Please provide a clear text description of what you need',
    });
  }

  // 10. Check for meaningful content (not just punctuation)
  const meaningfulChars = prompt.replace(/[^a-zA-Z0-9]/g, '').length;
  if (meaningfulChars < 5) {
    errors.push({
      field: 'content',
      message: 'Prompt lacks meaningful content',
      suggestion: 'Include letters and numbers to describe your request clearly',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates file path for input/output operations
 */
export function validateFilePath(filePath: string, operation: 'read' | 'write'): ValidationResult {
  const errors: ValidationError[] = [];

  if (!filePath || filePath.trim().length === 0) {
    errors.push({
      field: 'path',
      message: 'File path cannot be empty',
    });
    return { isValid: false, errors };
  }

  // Check for dangerous paths
  const dangerousPaths = ['/etc/', '/sys/', '/proc/', 'C:\\Windows\\', 'C:\\System32\\'];
  if (
    dangerousPaths.some((dangerous) => filePath.toLowerCase().includes(dangerous.toLowerCase()))
  ) {
    errors.push({
      field: 'path',
      message: 'File path points to a system directory',
      suggestion: 'Use a safe location like your home directory or project folder',
    });
  }

  // Check for valid file extensions for prompts
  if (operation === 'read') {
    const validExtensions = ['.txt', '.md', '.text', '.prompt'];
    const hasValidExtension = validExtensions.some((ext) => filePath.toLowerCase().endsWith(ext));
    if (!hasValidExtension) {
      errors.push({
        field: 'path',
        message: 'File should have a text-based extension',
        suggestion: `Use one of: ${validExtensions.join(', ')}`,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Displays validation errors in a user-friendly format
 */
export function displayValidationErrors(errors: ValidationError[]): void {
  console.log(pc.red(`\n${symbols.cross} Validation failed:\n`));

  errors.forEach((error, index) => {
    console.log(pc.red(`${symbols.bullet} ${error.message}`));
    if (error.suggestion) {
      console.log(pc.dim(`  ${symbols.bullet} ${error.suggestion}`));
    }
    if (index < errors.length - 1) {
      console.log('');
    }
  });

  console.log('');
}

/**
 * Validates command options
 */
export function validateOptions(options: Record<string, unknown>): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate mode
  if (
    options.mode &&
    typeof options.mode === 'string' &&
    !['sm', 'md', 'lg'].includes(options.mode)
  ) {
    errors.push({
      field: 'mode',
      message: 'Invalid enhancement mode',
      suggestion: 'Use one of: sm (small), md (medium), lg (large)',
    });
  }

  // Validate format
  if (
    options.format &&
    typeof options.format === 'string' &&
    !['plain', 'markdown'].includes(options.format)
  ) {
    errors.push({
      field: 'format',
      message: 'Invalid output format',
      suggestion: 'Use one of: plain, markdown',
    });
  }

  // Validate file paths
  if (options.file && typeof options.file === 'string') {
    const fileValidation = validateFilePath(options.file, 'read');
    errors.push(...fileValidation.errors);
  }

  if (options.output && typeof options.output === 'string') {
    const outputValidation = validateFilePath(options.output, 'write');
    errors.push(...outputValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates model options for AI processing
 */
export function validateModelOptions(
  provider: string,
  model: string,
  useStreaming = false,
): ModelValidationResult {
  // Use the comprehensive model validation from model-validation.ts
  return validateModelAndStreaming(provider, model, useStreaming);
}
