# AGENT.MD - Promptboost, Prompt Enhancer CLI

## 🎯 Objetivo del Proyecto

Crear una herramienta de línea de comandos que mejore automáticamente los prompts del usuario utilizando IA, optimizándolos para obtener mejores resultados cuando se usen con agentes de terminal como Gemini CLI, Claude Code, Open Code, etc.

## 📋 Especificaciones Técnicas

### Tecnologías
- **Lenguaje**: TypeScript
- **Runtime**: Bun 
- **CLI Framework**: Commander.js
- **Configuración**: JSON/YAML
- **HTTP Client**: Axios o Fetch nativo
- **Build**: Bun

### Proveedores de AI Soportados (v1.0)
- **OpenAI** (GPT-4o, o3)
- **Anthropic** (Claude)
- **Grok** (xAI)
- **Google** (Gemini)

### Proveedores Futuros
- Cohere
- Mistral
- Perplexity
- Replicate
- Local models (Ollama)

## 🏗️ Arquitectura del Proyecto

```
prompt-enhancer/
├── src/
│   ├── commands/
│   │   ├── enhance.ts
│   │   ├── config.ts
│   │   └── test.ts
│   ├── providers/
│   │   ├── base.ts
│   │   ├── openai.ts
│   │   ├── anthropic.ts
│   │   ├── grok.ts
│   │   └── google.ts
│   ├── utils/
│   │   ├── config.ts
│   │   ├── logger.ts
│   │   └── validation.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
├── templates/
│   ├── coding.md
│   ├── analysis.md
│   └── general.md
├── config/
│   └── default.json
├── tests/
├── docs/
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Comandos Disponibles

### Comando Principal
```bash
# Mejorar un prompt básico
promptboost "Create a React component"

# Mejorar con proveedor específico
promptboost "Create a React component" --provider openai

# Mejorar con template específico
promptboost "Analyze this data" --template analysis

# Modo interactivo
promptboost --interactive

# Mejorar desde archivo
promptboost --file prompt.txt

# Mejorar y copiar al clipboard
promptboost "Fix this bug" --copy

# Modo verbose para debugging
promptboost "Help me" --verbose
```

### Comandos de Configuración
```bash
# Configurar API keys
promptboost config set --provider openai --key sk-...
promptboost config set --provider anthropic --key ant-...

# Ver configuración actual
promptboost config show

# Listar proveedores disponibles
promptboost providers

# Test de conectividad
promptboost test --provider anthropic

# Seleccionar proveedor por defecto
promptboost config default --provider openai
```

## ⚙️ Configuración

### Archivo de Configuración (~/.promptboost/config.json)
```json
{
  "version": "1.0.0",
  "defaultProvider": "openai",
  "providers": {
    "openai": {
      "apiKey": "sk-...",
      "model": "gpt-4",
      "baseUrl": "https://api.openai.com/v1",
      "enabled": true
    },
    "anthropic": {
      "apiKey": "ant-...",
      "model": "claude-3-sonnet-20240229",
      "baseUrl": "https://api.anthropic.com",
      "enabled": true
    },
    "grok": {
      "apiKey": "xai-...",
      "model": "grok-beta",
      "baseUrl": "https://api.x.ai/v1",
      "enabled": false
    },
    "google": {
      "apiKey": "AIza...",
      "model": "gemini-pro",
      "baseUrl": "https://generativelanguage.googleapis.com",
      "enabled": false
    }
  },
  "settings": {
    "maxTokens": 1000,
    "temperature": 0.7,
    "timeout": 30000,
    "retries": 3,
    "defaultTemplate": "general",
    "outputFormat": "markdown"
  },
  "templates": {
    "coding": "templates/coding.md",
    "analysis": "templates/analysis.md",
    "general": "templates/general.md"
  }
}
```

## 🎨 Templates de Mejora

### Template General (templates/general.md)
```markdown
# Prompt Enhancement Instructions

You are a prompt optimization expert. Your task is to improve the given prompt to make it more effective and clear.

## Enhancement Rules:
1. Make the prompt more specific and detailed
2. Add context when necessary
3. Include expected output format
4. Add examples if helpful
5. Remove ambiguity
6. Optimize for the target AI system

## Input Prompt:
{USER_PROMPT}

## Enhanced Prompt:
[Return the improved version here]
```

### Template para Coding (templates/coding.md)
```markdown
# Coding Prompt Enhancement

Optimize this prompt for coding assistance:

## Original Prompt:
{USER_PROMPT}

## Enhancement Guidelines:
- Specify programming language if not mentioned
- Add context about the project/environment
- Define expected code structure
- Include error handling requirements
- Specify testing needs
- Add documentation requirements

## Enhanced Prompt:
[Return optimized coding prompt]
```

## 🔧 Definiciones de Tipos

### Interfaces Principales
```typescript
interface Provider {
  name: string;
  apiKey: string;
  model: string;
  baseUrl: string;
  enabled: boolean;
}

interface EnhanceRequest {
  prompt: string;
  provider?: string;
  template?: string;
  options?: EnhanceOptions;
}

interface EnhanceOptions {
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
  format?: 'markdown' | 'plain';
  includeOriginal?: boolean;
}

interface EnhanceResponse {
  original: string;
  enhanced: string;
  provider: string;
  model: string;
  timestamp: Date;
  tokensUsed: number;
}
```

## 📐 Reglas de Desarrollo

### Principios de Diseño
1. **Simplicidad**: El comando debe ser fácil de usar
2. **Flexibilidad**: Soportar múltiples proveedores y configuraciones
3. **Confiabilidad**: Manejo robusto de errores y fallbacks
4. **Extensibilidad**: Fácil agregar nuevos proveedores
5. **Seguridad**: API keys seguras y no expuestas

### Reglas de Implementación
1. **Validación**: Validar todas las entradas del usuario
2. **Error Handling**: Manejo graceful de errores de red/API
3. **Logging**: Logs detallados para debugging
4. **Testing**: Unit tests para cada proveedor
5. **Documentation**: JSDoc para todas las funciones públicas

### Reglas de Seguridad
1. **API Keys**: Nunca loggear o exponer API keys
2. **Encriptación**: Encriptar API keys en el archivo de config
3. **Permisos**: Archivo de config con permisos restrictivos (600)
4. **Validación**: Validar todas las respuestas de API
5. **Rate Limiting**: Respetar límites de cada proveedor

## 🎯 Casos de Uso Principales

### 1. Desarrollador usando Claude Code
```bash
# Usuario escribe:
promptboost "fix my react component"

# Sistema mejora a:
"Fix my React component by analyzing the code for common issues like performance problems, accessibility violations, prop validation, and TypeScript errors. Please provide the corrected code with comments explaining the changes made, and suggest best practices for similar components."
```

### 2. Analista usando Gemini CLI
```bash
# Usuario escribe:
promptboost "analyze this data" --template analysis

# Sistema mejora a:
"Perform a comprehensive analysis of the provided dataset including: descriptive statistics, data quality assessment, correlation analysis, trend identification, outlier detection, and actionable insights. Present findings in a structured format with visualizations suggestions and executive summary."
```

### 3. Modo Interactivo
```bash
promptboost --interactive
> Enter your prompt: create a todo app
> Select template: [coding/analysis/general] coding
> Select provider: [openai/anthropic/grok/google] anthropic
> Enhancing prompt...
> Enhanced prompt ready! Copy to clipboard? [y/N] y
```

## 🧪 Testing Strategy

### Unit Tests
- Cada proveedor de AI
- Validación de configuración
- Parsing de templates
- Manejo de errores

### Integration Tests
- Flujo completo de enhancement
- Configuración de API keys
- Fallback entre proveedores

### E2E Tests
- Comandos CLI completos
- Archivos de configuración
- Modo interactivo

## 📦 Distribución

### NPM Package
```bash
npm install -g prompt-enhancer-cli
```

### Binarios Compilados
- Windows (exe)
- macOS (dmg)
- Linux (AppImage/deb)

## 🔄 Roadmap

### v1.0 (MVP)
- [x] Soporte para 4 proveedores principales
- [x] Comando básico de enhancement
- [x] Configuración de API keys
- [x] Templates básicos

### v1.1
- [ ] Modo interactivo
- [ ] Historial de prompts
- [ ] Mejoras automáticas basadas en feedback

### v1.2
- [ ] Proveedores adicionales
- [ ] Templates personalizados
- [ ] Integración con otros CLI tools

### v2.0
- [ ] AI local con Ollama
- [ ] Learning from user preferences
- [ ] Advanced prompt engineering features

## 🎨 UI/UX Guidelines

### Output Format
```
🚀 Enhancing prompt...
✓ Connected to OpenAI (gpt-4)
✓ Applied 'coding' template
✓ Enhanced prompt ready!

📝 Original:
"create a react component"

✨ Enhanced:
"Create a React functional component with the following specifications:
- Use TypeScript for type safety
- Implement proper prop validation
- Include error boundaries
- Add accessibility attributes
- Use modern React hooks (useState, useEffect)
- Include JSDoc documentation
- Provide example usage
- Follow React best practices and conventions

Please structure the component with clear imports, interfaces, and export statements."

📊 Stats: 127 tokens used | 0.8s response time
💡 Tip: Use --copy to copy enhanced prompt to clipboard
```

### Error Messages
```
❌ Error: OpenAI API key not configured
💡 Run: promptboost config set --provider openai --key your-api-key

❌ Error: Rate limit exceeded (openai)
🔄 Trying fallback provider: anthropic...
✓ Enhanced with anthropic instead
```

## 🔐 Environment Variables

```bash
# Alternative to config file
export PROMPTAI_OPENAI_KEY="sk-..."
export PROMPTAI_ANTHROPIC_KEY="ant-..."
export PROMPTAI_GROK_KEY="xai-..."
export PROMPTAI_GOOGLE_KEY="AIza..."
export PROMPTAI_DEFAULT_PROVIDER="openai"
```

## 📄 Licencia

MIT License