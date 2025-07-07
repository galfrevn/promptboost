# PromptBoost CLI 🚀

A powerful command-line tool that enhances prompts using AI providers to optimize interactions with terminal agents like Claude Code, Gemini CLI, Open Code, and more.

## ✨ Features

- 🤖 **Multiple AI Providers**: OpenAI, Anthropic, Grok (xAI), Google Gemini
- 🎨 **Smart Templates**: Coding, analysis, and general-purpose templates
- ⚙️ **Easy Configuration**: Secure API key management with environment variables
- 🎯 **Beautiful Output**: Colorized CLI with clear formatting
- 📁 **File Operations**: Read from files, save to files
- 🔄 **Robust Error Handling**: Retry logic and graceful fallbacks
- ⚡ **Fast Performance**: Built with Bun for lightning-fast execution

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) (latest version)
- API keys for at least one provider

### Installation (Development)

```bash
# Clone the repository
git clone <your-repo-url>
cd promptup

# Install dependencies
bun install

# Run the CLI in development mode
bun run dev --help
```

## 🔧 Development Setup

### Project Structure

```
promptup/
├── src/
│   ├── commands/          # CLI command implementations
│   │   ├── enhance.ts     # Main enhancement command
│   │   ├── config.ts      # Configuration management
│   │   └── test.ts        # Provider testing
│   ├── providers/         # AI provider implementations
│   │   ├── base.ts        # Abstract base provider
│   │   ├── openai.ts      # OpenAI integration
│   │   ├── anthropic.ts   # Anthropic Claude integration
│   │   ├── grok.ts        # xAI Grok integration
│   │   └── google.ts      # Google Gemini integration
│   ├── utils/             # Utility modules
│   │   ├── config.ts      # Configuration management
│   │   ├── logger.ts      # Logging utility
│   │   └── template.ts    # Template engine
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts       # All interface definitions
│   └── index.ts           # Main CLI entry point
├── templates/             # Built-in prompt templates
│   ├── general.md         # General-purpose template
│   ├── coding.md          # Software development template
│   └── analysis.md        # Data analysis template
├── config/
│   └── default.json       # Default configuration
└── tests/                 # Test files (future)
```

### Development Commands

```bash
# Start development server
bun run dev

# Type checking
bun run typecheck

# Linting and formatting
bun run lint
bun run format

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

## 🎯 Usage Examples

### Basic Enhancement

```bash
# Enhance a simple prompt
bun run dev "Create a React component"

# Use a specific provider
bun run dev "Fix my code" --provider anthropic

# Apply a template
bun run dev "Analyze this data" --template analysis
```

### Configuration

```bash
# Set up OpenAI
bun run dev config-set --provider-name openai --key sk-your-key-here

# Set up Anthropic
bun run dev config-set --provider-name anthropic --key ant-your-key-here

# View current configuration
bun run dev config-show

# Test provider connectivity
bun run dev test --provider openai
```

### File Operations

```bash
# Enhance prompt from file
bun run dev --file prompt.txt

# Save enhanced prompt to file
bun run dev "My prompt" --output enhanced.txt

# Different output formats
bun run dev "My prompt" --format plain
```

## 🔑 API Key Configuration

### Method 1: CLI Configuration

```bash
bun run dev config-set --provider-name openai --key sk-your-key-here
bun run dev config-set --provider-name anthropic --key ant-your-key-here
bun run dev config-set --provider-name grok --key xai-your-key-here
bun run dev config-set --provider-name google --key AIza-your-key-here
```

### Method 2: Environment Variables

```bash
export PROMPTBOOST_OPENAI_KEY="sk-your-key-here"
export PROMPTBOOST_ANTHROPIC_KEY="ant-your-key-here"
export PROMPTBOOST_GROK_KEY="xai-your-key-here"
export PROMPTBOOST_GOOGLE_KEY="AIza-your-key-here"
export PROMPTBOOST_DEFAULT_PROVIDER="openai"
```

### Method 3: Config File

Configuration is stored in `~/.promptboost/config.json`:

```json
{
  "version": "1.0.0",
  "defaultProvider": "openai",
  "providers": {
    "openai": {
      "apiKey": "sk-your-key-here",
      "model": "gpt-4o",
      "enabled": true
    }
  }
}
```

## 🧪 Testing

### Provider Testing

```bash
# Test all configured providers
bun run dev test

# Test specific provider
bun run dev test --provider openai

# Verbose testing
bun run dev test --verbose
```

### Manual Testing Workflow

1. **Setup**: Configure at least one provider
2. **Basic Test**: Run a simple enhancement
3. **Template Test**: Try different templates
4. **File Test**: Test file input/output
5. **Error Test**: Test with invalid API keys

## 🏗️ Architecture

### Provider System

- **BaseProvider**: Abstract class with common functionality
- **Retry Logic**: Exponential backoff for failed requests
- **Error Handling**: Provider-specific error codes and messages
- **Token Counting**: Rough estimation for usage tracking

### Configuration System

- **Secure Storage**: API keys stored with 600 permissions
- **Environment Override**: Environment variables take precedence
- **Validation**: Configuration validation with helpful error messages
- **Migration**: Future-proof configuration versioning

### Template System

- **Variable Substitution**: `{USER_PROMPT}` replacement
- **Markdown Support**: Rich template formatting
- **Custom Templates**: User-defined templates (future feature)

## 📝 Adding New Providers

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

3. **Add Default Configuration**:
   ```typescript
   // src/utils/config.ts
   newprovider: {
     name: 'newprovider',
     apiKey: '',
     model: 'default-model',
     baseUrl: 'https://api.newprovider.com',
     enabled: false,
   }
   ```

## 🐛 Debugging

### Enable Debug Logging

```bash
bun run dev "test prompt" --verbose
```

### Common Issues

1. **API Key Issues**:
   ```bash
   # Check configuration
   bun run dev config-show
   
   # Test connectivity
   bun run dev test --provider openai
   ```

2. **Template Issues**:
   ```bash
   # List available templates
   bun run dev providers
   
   # Try without template
   bun run dev "test prompt"
   ```

3. **File Permission Issues**:
   ```bash
   # Check config file permissions
   ls -la ~/.promptboost/config.json
   
   # Should show: -rw------- (600)
   ```

## 🔮 Future Features

- [ ] Interactive mode with menus
- [ ] History and analytics
- [ ] Caching system
- [ ] Batch file processing
- [ ] Plugin system
- [ ] Local LLM support (Ollama)

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
