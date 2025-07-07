# ![PromptBoost CLI](https://raw.githubusercontent.com/galfrevn/promptboost/main/public/logo.png)

> AI-Powered Prompt Enhancement Tool - Intelligent and Extensible

[![github release version](https://img.shields.io/github/v/release/galfrevn/promptboost.svg?include_prereleases)](https://github.com/galfrevn/promptboost/releases/latest) [![npm version](https://img.shields.io/npm/v/promptboost.svg)](https://www.npmjs.com/package/promptboost) [![license](https://img.shields.io/github/license/galfrevn/promptboost.svg)](https://github.com/galfrevn/promptboost/blob/main/LICENSE) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-ff69b4.svg)](https://github.com/galfrevn/promptboost/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) [![code with hearth by galfrevn](https://img.shields.io/badge/%3C%2F%3E%20with%20%E2%99%A5%20by-galfrevn-ff1414.svg)](https://github.com/galfrevn)

<img src="https://raw.githubusercontent.com/galfrevn/promptboost/main/assets/demo.gif" alt="PromptBoost CLI Demo" />

A powerful command-line tool that enhances prompts using AI providers to optimize interactions with terminal agents like Claude Code, Gemini CLI, OpenAI Code, and more.

## � Table of Contents

- [Providers](#-providers)
- [Why PromptBoost CLI?](#-why-promptboost-cli)
- [Features](#-features)
- [Examples](#-examples)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Providers

### Supported AI Providers

| Name | Description | Models |
| --- | --- | --- |
| [`OpenAI`](https://openai.com/) | GPT models including latest GPT-4 variants | `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `o1`, `o3-mini` |
| [`Anthropic`](https://www.anthropic.com/) | Claude models with advanced reasoning | `claude-3.5-sonnet`, `claude-3-haiku`, `claude-4-opus` |
| [`Google`](https://ai.google.dev/) | Gemini models with multimodal capabilities | `gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-2.0-flash` |
| [`xAI Grok`](https://x.ai/) | Grok models with real-time information | `grok-3`, `grok-beta`, `grok-vision-beta` |

### Provider Features

| Feature | OpenAI | Anthropic | Google | xAI Grok |
| --- | :---: | :---: | :---: | :---: |
| **Streaming** | ✅ | ✅ | ✅ | ✅ |
| **Model Validation** | ✅ | ✅ | ✅ | ✅ |
| **Error Recovery** | ✅ | ✅ | ✅ | ✅ |
| **Token Counting** | ✅ | ✅ | ✅ | ✅ |

## 🤖 Why PromptBoost CLI?

PromptBoost CLI provides **intelligent prompt enhancement** across multiple AI providers. Whether you're coding, analyzing data, or writing documentation, PromptBoost transforms your simple prompts into comprehensive, context-rich instructions that get better results.

### Intelligent Prompt Enhancement

![prompt-enhancement](https://raw.githubusercontent.com/galfrevn/promptboost/main/assets/enhancement-demo.png)

**Smart Context Addition**

PromptBoost doesn't just pass your prompts through—it enhances them with:

* **Context Awareness**: Automatically adds relevant context based on your prompt type
* **Best Practices**: Incorporates proven prompt engineering techniques
* **Template Integration**: Uses specialized templates for coding, analysis, and general tasks
* **Format Optimization**: Structures prompts for maximum AI comprehension

### Multi-Provider Intelligence

![multi-provider](https://raw.githubusercontent.com/galfrevn/promptboost/main/assets/providers.png)

* **Provider Switching**: Seamlessly switch between OpenAI, Anthropic, Google, and xAI
* **Model Validation**: Automatic validation of model names and capabilities
* **Streaming Support**: Real-time response streaming with compatibility checking
* **Fallback System**: Robust error handling with provider fallbacks

### Developer-Friendly Features

![developer-features](https://raw.githubusercontent.com/galfrevn/promptboost/main/assets/dev-features.png)

* **File Integration**: Read prompts from files, save enhanced results
* **Template System**: Built-in templates for common use cases
* **Configuration Management**: Secure API key storage and provider management
* **Verbose Logging**: Detailed logging for debugging and optimization

## 🎨 Features

* **Model Validation**: Comprehensive validation of AI models with streaming compatibility checking
* **Smart Enhancement**: Context-aware prompt improvement using proven techniques
* **Multi-Provider Support**: Seamless integration with OpenAI, Anthropic, Google, and xAI
* **Streaming Responses**: Real-time response streaming with progress indicators
* **Template System**: Built-in templates for coding, analysis, and general use cases
* **File Operations**: Read from files, save enhanced prompts, batch processing
* **Configuration Management**: Secure API key storage with environment variable support
* **Error Recovery**: Robust retry logic with exponential backoff
* **Beautiful CLI**: Colorized output with progress indicators and clear formatting
* **Developer Tools**: Verbose logging, testing utilities, and debugging features

## 🐾 Examples

### Basic Enhancement
```bash
# Simple prompt enhancement
promptboost "Create a React component"

# Use specific provider
promptboost "Fix my code" --provider anthropic
```

### Advanced Usage
```bash
# Streaming with verbose output
promptboost "Explain quantum computing" --stream --verbose

# File operations
promptboost --file prompt.txt --output enhanced.txt

# Configuration and testing
promptboost config set --provider openai --key sk-your-key
promptboost test --provider anthropic
```

### Model Validation
```bash
# Set valid model (auto-validated)
promptboost config set --provider openai --model gpt-4o-mini
✓ Configuration updated for provider: openai

# Try invalid model (caught by validation)
promptboost config set --provider openai --model invalid-model
✗ Invalid model configuration:
  • Model 'invalid-model' is not valid for provider 'openai'
  • Valid models for openai: gpt-4o, gpt-4o-mini, gpt-4-turbo...
```

More [examples and tutorials](https://github.com/galfrevn/promptboost/tree/main/examples) are available!

## 📦 Installation

### NPM (Recommended)
```bash
npm install -g promptboost
```

### From Source
```bash
# Clone the repository
git clone https://github.com/galfrevn/promptboost.git
cd promptboost

# Install dependencies
bun install

# Build and link
bun run build
npm link
```

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh)
- API keys for at least one supported provider

## 🚀 Quick Start

### 1. Install PromptBoost
```bash
npm install -g promptboost
```

### 2. Configure a Provider
```bash
# OpenAI (recommended for beginners)
promptboost config set --provider openai --key sk-your-openai-key

# Anthropic (great for coding)
promptboost config set --provider anthropic --key ant-your-anthropic-key

# Google (multimodal capabilities)
promptboost config set --provider google --key AIza-your-google-key

# xAI Grok (real-time information)
promptboost config set --provider grok --key xai-your-grok-key
```

### 3. Enhance Your First Prompt
```bash
promptboost "Create a simple web scraper in Python"
```

### 4. Explore Advanced Features
```bash
# Use streaming for real-time responses
promptboost "Explain machine learning" --stream

# Save results to file
promptboost "Write API documentation" --output docs.md
```

## 🔑 Configuration

### Method 1: CLI Configuration (Recommended)

```bash
# Configure providers with automatic validation
promptboost config set --provider openai --key sk-your-openai-key
promptboost config set --provider anthropic --key ant-your-anthropic-key
promptboost config set --provider google --key AIza-your-google-key
promptboost config set --provider grok --key xai-your-grok-key

# Set specific models (with validation)
promptboost config set --provider openai --model gpt-4o-mini
promptboost config set --provider anthropic --model claude-3-5-sonnet-20241022

# Set default provider
promptboost config set --default openai

# View configuration
promptboost config show
```

### Method 2: Environment Variables

```bash
export PROMPTBOOST_OPENAI_KEY="sk-your-openai-key"
export PROMPTBOOST_ANTHROPIC_KEY="ant-your-anthropic-key"
export PROMPTBOOST_GOOGLE_KEY="AIza-your-google-key"
export PROMPTBOOST_GROK_KEY="xai-your-grok-key"
export PROMPTBOOST_DEFAULT_PROVIDER="openai"
```

### Method 3: Configuration File

Configuration is stored in `~/.promptboost/config.json`:

```json
{
  "version": "1.0.0",
  "defaultProvider": "openai",
  "providers": {
    "openai": {
      "name": "openai",
      "apiKey": "sk-your-key-here",
      "model": "gpt-4o-mini",
      "baseUrl": "https://api.openai.com/v1",
      "enabled": true
    },
    "anthropic": {
      "name": "anthropic",
      "apiKey": "ant-your-key-here",
      "model": "claude-3-5-sonnet-20241022",
      "baseUrl": "https://api.anthropic.com",
      "enabled": true
    }
  }
}
```

### Model Validation

PromptBoost automatically validates model names and streaming compatibility:

```bash
# ✅ Valid model names are accepted
promptboost config set --provider openai --model gpt-4o-mini
✓ Configuration updated for provider: openai

# ❌ Invalid models are rejected with helpful suggestions
promptboost config set --provider openai --model gpt-5
✗ Invalid model configuration:
  • Model 'gpt-5' is not valid for provider 'openai'
  • Valid models for openai: gpt-4o, gpt-4o-mini, gpt-4-turbo...

# ⚠️ Special models show warnings
promptboost config set --provider openai --model o1-mini
⚠️ Note: o1-mini is a reasoning model with longer response times.
✓ Configuration updated for provider: openai
```

## 🔧 Development

### Project Structure

```
promptboost/
├── src/
│   ├── commands/              # CLI command implementations
│   │   ├── enhance.ts         # Main enhancement command
│   │   ├── config.ts          # Configuration management
│   │   └── test.ts            # Provider testing
│   ├── providers/             # AI provider implementations
│   │   ├── base.ts            # Abstract base provider
│   │   ├── openai.ts          # OpenAI integration
│   │   ├── anthropic.ts       # Anthropic Claude integration
│   │   ├── grok.ts            # xAI Grok integration
│   │   └── google.ts          # Google Gemini integration
│   ├── utils/                 # Utility modules
│   │   ├── config.ts          # Configuration management
│   │   ├── logger.ts          # Logging utility
│   │   ├── validation.ts      # Input validation
│   │   └── model-validation.ts # AI model validation
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts           # All interface definitions
│   └── index.ts               # Main CLI entry point
├── examples/                  # Usage examples
└── tests/                     # Test files
```

### Setup

Fork `main` branch into your personal repository. Clone it to local computer. Install node modules. Before starting development, you should check if there are any errors.

```bash
$ git clone https://github.com/{your-personal-repo}/promptboost.git
$ cd promptboost
$ bun install
$ bun run build
$ bun run test
```

### Development Commands

```bash
# Start development mode
bun run dev

# Type checking
bun run typecheck

# Linting and formatting
bun run lint

# Build for production
bun run build

# Run tests
bun run test
```

### Code Style

This project uses [Biome](https://biomejs.dev/) for linting and formatting:

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for JavaScript, double for JSON
- **Semicolons**: Always required
- **Line width**: 100 characters

### Adding New Providers

To add a new AI provider:

1. **Create Provider Class**:
   ```typescript
   // src/providers/newprovider.ts
   export class NewProvider extends BaseProvider {
     async enhance(request: EnhanceRequest): Promise<EnhanceResponse> {
       // Implementation
     }
   }
   ```

2. **Update Provider Factory**:
   ```typescript
   // src/providers/index.ts
   case 'newprovider':
     return new NewProvider(provider);
   ```

3. **Add Model Validation**:
   ```typescript
   // src/utils/model-validation.ts
   newprovider: {
     'model-name': { streaming: true },
     // ... other models
   }
   ```

### Testing

```bash
# Test all providers
bun run test

# Test specific functionality
promptboost test --provider openai --verbose

# Manual testing workflow
promptboost config set --provider openai --key test-key
promptboost "test prompt" --verbose
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `bun run test`
5. Run linting: `bun run lint`
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Bun](https://bun.sh) - Fast JavaScript runtime
- [Commander.js](https://github.com/tj/commander.js) - CLI framework
- [Biome](https://biomejs.dev/) - Linting and formatting
- [Picocolors](https://github.com/alexeyraspopov/picocolors) - Terminal colors

---

**Built with ❤️ using TypeScript and Bun**
