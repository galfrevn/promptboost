import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Template } from '@/types/index.js';
import { logger } from '@/utils/logger.js';

export class TemplateManager {
  private templatesDir: string;
  private templates: Map<string, Template> = new Map();

  constructor(templatesDir = 'templates') {
    this.templatesDir = templatesDir;
  }

  async loadTemplate(name: string): Promise<Template | null> {
    if (this.templates.has(name)) {
      return this.templates.get(name)!;
    }

    const templatePath = join(this.templatesDir, `${name}.md`);

    if (!existsSync(templatePath)) {
      logger.warn(`Template not found: ${name}`);
      return null;
    }

    try {
      const content = readFileSync(templatePath, 'utf-8');
      const variables = this.extractVariables(content);

      const template: Template = {
        name,
        content,
        variables,
      };

      this.templates.set(name, template);
      logger.debug(`Loaded template: ${name}`, { variables });

      return template;
    } catch (error) {
      logger.error(`Failed to load template: ${name}`, { error });
      return null;
    }
  }

  private extractVariables(content: string): string[] {
    const variableRegex = /\{([^}]+)\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      variables.push(match[1]);
    }

    return [...new Set(variables)];
  }

  applyTemplate(template: Template, variables: Record<string, string>): string {
    let result = template.content;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      result = result.replaceAll(placeholder, value);
    }

    return result;
  }

  getAvailableTemplates(): string[] {
    return ['general', 'coding', 'analysis'];
  }

  async generatePromptWithTemplate(templateName: string, userPrompt: string): Promise<string> {
    const template = await this.loadTemplate(templateName);

    if (!template) {
      logger.warn(`Template not found, using default enhancement: ${templateName}`);
      return this.getDefaultEnhancementPrompt(userPrompt);
    }

    return this.applyTemplate(template, {
      USER_PROMPT: userPrompt,
    });
  }

  private getDefaultEnhancementPrompt(userPrompt: string): string {
    return `You are a prompt optimization expert. Your task is to improve the given prompt to make it more effective, specific, and clear. Follow these guidelines:
1. Make the prompt more specific and detailed
2. Add context when necessary
3. Include expected output format
4. Add examples if helpful
5. Remove ambiguity
6. Optimize for AI systems

Original prompt: ${userPrompt}

Return only the enhanced prompt without any additional explanation.`;
  }
}

export const templateManager = new TemplateManager();
