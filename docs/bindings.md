# Binding System Guide

The binding system transforms Faber's universal concept definitions into framework-specific deployments. This guide explains how to use and create bindings.

## Overview

Bindings are the bridge between Faber's abstract definitions and concrete AI framework implementations. They enable write-once, deploy-anywhere functionality.

```
Universal Definition → [Binding Transformer] → Framework-Specific Output
                              ↓
                    Claude Code, LangGraph, CrewAI, etc.
```

## How Bindings Work

### Transformation Pipeline

1. **Load Concept** - Read universal definition
2. **Apply Overlays** - Merge customizations
3. **Select Binding** - Choose target framework
4. **Transform** - Convert to framework format
5. **Generate Artifacts** - Create deployment files

### Components

Each binding consists of:
- **Transformer** - Core conversion logic
- **Templates** - Framework-specific templates
- **Configuration** - Binding settings
- **Validators** - Compatibility checks

## Built-in Bindings

### Claude Code

**Status**: ✅ Implemented

Transforms concepts into Claude Code agents for Anthropic's AI assistant.

```bash
faber build claude role issue-manager
```

**Output Structure**:
```
deployments/claude/
├── .claude/
│   └── agents/{org}/{system}/{name}.md
├── docs/agents/{org}/{system}/{name}/
│   ├── contexts/
│   ├── tasks/
│   └── flows/
└── .faber/
    └── config.yml
```

**Features**:
- Full prompt generation
- Context lazy loading
- MCP server integration
- Task decomposition

### LangGraph

**Status**: 🚧 In Development

Transforms concepts into LangGraph state machines.

```bash
faber build langgraph role issue-manager
```

**Output Structure**:
```
deployments/langgraph/
├── graphs/
│   └── {name}_graph.py
├── nodes/
│   └── {name}_nodes.py
├── state/
│   └── {name}_state.py
└── requirements.txt
```

**Features**:
- State machine generation
- Node composition
- Edge conditions
- Async execution

### CrewAI

**Status**: 📋 Planned

Transforms concepts into CrewAI agent crews.

```bash
faber build crewai team dev-squad
```

**Output Structure**:
```
deployments/crewai/
├── agents/
│   └── {name}_agent.py
├── tasks/
│   └── {name}_tasks.py
├── crews/
│   └── {name}_crew.py
└── requirements.txt
```

**Features**:
- Agent class generation
- Task definitions
- Crew composition
- Tool integration

## Using Bindings

### Basic Usage

```bash
# Build with default binding
faber build claude role my-agent

# Build with custom output
faber build claude role my-agent --output ./custom-deploy

# Build without overlays
faber build claude role my-agent --no-overlays

# Dry run to preview
faber build claude role my-agent --dry-run
```

### Configuration

Configure bindings in `.faber/config.yml`:

```yaml
bindings:
  claude:
    auto_activate: true
    default_platform: github
    context_loading: lazy

  langgraph:
    python_version: "3.10"
    async_mode: true
    state_persistence: redis

  crewai:
    llm_provider: openai
    max_iterations: 10
    verbose: true
```

### Platform Selection

Bindings respect platform configuration:

```yaml
platforms:
  issue-manager: linear
  repo-manager: github

# Build uses Linear platform context
faber build claude role issue-manager

# Override platform
faber build claude role issue-manager --platform github
```

## Creating Custom Bindings

### Directory Structure

```
src/bindings/your-framework/
├── index.ts               # Entry point
├── transformer.ts         # Main transformer
├── templates/            # Template files
│   ├── agent.hbs        # Agent template
│   ├── task.hbs         # Task template
│   └── config.hbs       # Config template
├── validators/          # Validation logic
│   └── compatibility.ts
└── config/             # Default config
    └── defaults.yml
```

### Step 1: Create Transformer

```typescript
// src/bindings/your-framework/transformer.ts
import { BindingTransformer, DeploymentArtifact, Config } from '../../types';
import { Role, Team, Workflow } from '../../types/concepts';

export class YourFrameworkTransformer implements BindingTransformer {
  private templates: Map<string, HandlebarsTemplate>;

  constructor() {
    this.loadTemplates();
  }

  async transform(
    concept: Role | Team | Workflow,
    config: Config,
    overlays: Overlays
  ): Promise<DeploymentArtifact> {
    // Apply overlays to concept
    const merged = this.mergeOverlays(concept, overlays);

    // Transform to framework format
    const transformed = this.transformConcept(merged);

    // Generate files
    const files = await this.generateFiles(transformed);

    return {
      framework: 'your-framework',
      concept: concept.name,
      files: files,
      metadata: this.generateMetadata(concept)
    };
  }

  private transformConcept(concept: any): any {
    // Framework-specific transformation logic
    switch (concept.type) {
      case 'role':
        return this.transformRole(concept);
      case 'team':
        return this.transformTeam(concept);
      case 'workflow':
        return this.transformWorkflow(concept);
    }
  }

  private async generateFiles(data: any): Promise<FileArtifact[]> {
    const files: FileArtifact[] = [];

    // Generate main file
    files.push({
      path: `agents/${data.name}.py`,
      content: this.templates.get('agent')!(data)
    });

    // Generate supporting files
    // ...

    return files;
  }
}
```

### Step 2: Create Templates

```handlebars
{{!-- templates/agent.hbs --}}
"""
Agent: {{name}}
Description: {{description}}
Generated by Faber-CLI
"""

from your_framework import Agent, Task, Tool
{{#if imports}}
{{#each imports}}
from {{module}} import {{name}}
{{/each}}
{{/if}}

class {{className}}(Agent):
    """{{description}}"""

    def __init__(self):
        super().__init__(
            name="{{name}}",
            description="""{{description}}""",
            {{#if platforms}}
            platforms={{toPythonList platforms}},
            {{/if}}
            {{#if tools}}
            tools=[
                {{#each tools}}
                {{name}}(){{#unless @last}},{{/unless}}
                {{/each}}
            ]
            {{/if}}
        )

    {{#each tasks}}
    def {{name}}(self, **kwargs):
        """{{description}}"""
        {{#if implementation}}
        {{implementation}}
        {{else}}
        # TODO: Implement {{name}}
        pass
        {{/if}}

    {{/each}}
```

### Step 3: Register Binding

```typescript
// src/bindings/registry.ts
import { ClaudeCodeTransformer } from './claude-code';
import { YourFrameworkTransformer } from './your-framework';

export const bindingRegistry = new Map([
  ['claude', ClaudeCodeTransformer],
  ['your-framework', YourFrameworkTransformer],
]);

export function getBinding(name: string): BindingTransformer {
  const Transformer = bindingRegistry.get(name);
  if (!Transformer) {
    throw new Error(`Unknown binding: ${name}`);
  }
  return new Transformer();
}
```

### Step 4: Add CLI Support

```typescript
// src/cli/commands/build.ts
const frameworks = ['claude', 'langgraph', 'crewai', 'your-framework'];

// Command will automatically support your framework
```

## Advanced Features

### Context Transformation

Transform Faber contexts for your framework:

```typescript
private transformContexts(contexts: Context[]): any {
  return contexts.map(ctx => {
    switch (ctx.category) {
      case 'specialist':
        return this.createSpecialistModule(ctx);
      case 'platform':
        return this.createPlatformAdapter(ctx);
      case 'standard':
        return this.createStandardsChecker(ctx);
      // ...
    }
  });
}
```

### Task Mapping

Map generic tasks to framework operations:

```typescript
private mapTask(task: Task): any {
  return {
    name: this.pythonize(task.name),
    description: task.description,
    inputs: this.mapInputs(task.inputs),
    outputs: this.mapOutputs(task.outputs),
    implementation: this.generateImplementation(task)
  };
}
```

### Platform Integration

Handle platform-specific code:

```typescript
private generatePlatformCode(platform: string): string {
  switch (platform) {
    case 'github':
      return `
        from github import Github
        client = Github(os.getenv('GITHUB_TOKEN'))
      `;
    case 'linear':
      return `
        from linear import LinearClient
        client = LinearClient(api_key=os.getenv('LINEAR_API_KEY'))
      `;
    // ...
  }
}
```

### MCP Server Integration

Generate MCP client code:

```typescript
private generateMCPClient(server: MCPServer): string {
  return `
    mcp_client = MCPClient(
      command="${server.command}",
      args=${JSON.stringify(server.args)},
      env={
        ${Object.entries(server.env || {})
          .map(([k, v]) => `"${k}": os.getenv("${v}")`)
          .join(',\n        ')}
      }
    )
  `;
}
```

## Binding Configuration

### Per-Role Configuration

Override binding behavior per role:

```yaml
# roles/my-role/bindings/your-framework.yml
extends: default
config:
  async_mode: false
  custom_option: value
templates:
  agent: custom-agent.hbs
```

### Template Overrides

```handlebars
{{!-- roles/my-role/bindings/templates/custom-agent.hbs --}}
{{!-- Custom template for this specific role --}}
```

### Validation Rules

```yaml
# roles/my-role/bindings/validation.yml
your-framework:
  requires:
    - python >= 3.8
    - your-framework >= 2.0
  incompatible_with:
    - legacy-mode
```

## Testing Bindings

### Unit Tests

```typescript
describe('YourFrameworkTransformer', () => {
  it('should transform role to agent', async () => {
    const transformer = new YourFrameworkTransformer();
    const role = await loadRole('test-role');
    const artifact = await transformer.transform(role, config, overlays);

    expect(artifact.files).toHaveLength(3);
    expect(artifact.files[0].path).toBe('agents/test-role.py');
  });
});
```

### Integration Tests

```typescript
describe('Your Framework Integration', () => {
  it('should generate working code', async () => {
    const result = await buildConcept('your-framework', 'role', 'test');
    const code = readGeneratedFile('agents/test.py');

    // Validate Python syntax
    const { status } = await exec(`python -m py_compile ${code}`);
    expect(status).toBe(0);
  });
});
```

### Validation Tests

```typescript
describe('Binding Validation', () => {
  it('should validate compatibility', () => {
    const validator = new YourFrameworkValidator();
    const role = loadRole('test-role');
    const result = validator.validate(role);

    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });
});
```

## Framework-Specific Guides

### Python Frameworks

Common patterns for Python-based frameworks:

```typescript
// Helper utilities
export class PythonBindingHelper {
  pythonize(name: string): string {
    return name.replace(/-/g, '_').toLowerCase();
  }

  toPythonList(arr: string[]): string {
    return `[${arr.map(s => `"${s}"`).join(', ')}]`;
  }

  generateImports(deps: string[]): string {
    return deps.map(d => `import ${d}`).join('\n');
  }
}
```

### JavaScript Frameworks

Common patterns for JS/TS frameworks:

```typescript
export class JSBindingHelper {
  camelCase(name: string): string {
    return name.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  generateExports(items: string[]): string {
    return `export { ${items.join(', ')} };`;
  }
}
```

### Configuration Files

Generate framework configs:

```typescript
private generateConfig(framework: string): any {
  switch (framework) {
    case 'python':
      return this.generatePyprojectToml();
    case 'node':
      return this.generatePackageJson();
    case 'docker':
      return this.generateDockerfile();
  }
}
```

## Best Practices

### 1. Preserve Semantics

Maintain concept meaning across transformation:
- Role → Agent/Actor/Worker
- Task → Action/Step/Operation
- Flow → Workflow/Pipeline/Chain

### 2. Handle Limitations

Document and handle framework limitations:
```typescript
if (!framework.supportsAsync && concept.requiresAsync) {
  logger.warn('Framework does not support async operations');
  // Generate sync alternatives or throw error
}
```

### 3. Optimize Output

Generate idiomatic code for each framework:
- Follow framework conventions
- Use framework utilities
- Leverage framework features

### 4. Provide Fallbacks

Handle missing features gracefully:
```typescript
if (!framework.hasMCPSupport) {
  // Generate direct API calls instead
  return this.generateDirectAPIClient(platform);
}
```

### 5. Include Documentation

Generate helpful comments and docs:
```typescript
/**
 * Agent: ${concept.name}
 * Generated from: ${conceptPath}
 * Platform: ${platform}
 *
 * Customization: Edit bindings/${framework}.yml
 */
```

## Troubleshooting

### Common Issues

**"Unknown binding: xyz"**
- Check binding is registered in registry
- Verify binding name spelling
- Ensure binding module exports transformer

**"Template not found"**
- Check template file exists
- Verify template path in transformer
- Ensure Handlebars compilation succeeded

**"Transformation failed"**
- Check concept validation passes
- Verify binding compatibility
- Review transformer error logs

**"Generated code invalid"**
- Validate template syntax
- Check variable substitution
- Test with minimal concept

### Debug Mode

Enable debug output:
```bash
DEBUG=faber:binding:* faber build your-framework role test
```

### Validation Mode

Test without generation:
```bash
faber validate role test --binding your-framework
```

## Contributing Bindings

### Checklist

- [ ] Transformer implementation
- [ ] Template files
- [ ] Configuration schema
- [ ] Validation logic
- [ ] Unit tests
- [ ] Integration tests
- [ ] Documentation
- [ ] Example output

### Submission

1. Fork repository
2. Create `feature/binding-{framework}` branch
3. Implement binding
4. Add tests and docs
5. Submit pull request

### Quality Standards

- Support all concept types
- Handle overlays properly
- Generate valid framework code
- Include error handling
- Document limitations

## Future Roadmap

### Planned Bindings

- **AutoGen** - Microsoft's multi-agent framework
- **LlamaIndex** - Data framework agents
- **Haystack** - NLP pipeline framework
- **Rasa** - Conversational AI platform

### Binding Features

- **Hot reload** - Live binding updates
- **Validation suite** - Comprehensive testing
- **Performance profiling** - Optimization tools
- **Custom pipelines** - Pluggable transformers
- **Binding composition** - Mix multiple frameworks

### Ecosystem Integration

- IDE plugins for binding development
- Binding marketplace
- Automated testing infrastructure
- Cross-binding compatibility layer

## Next Steps

- [Creating a Binding Tutorial](examples.md#create-custom-binding)
- [API Reference](api.md#bindings)
- [Contributing Guide](contributing.md#new-bindings)
- [Testing Guide](testing.md#binding-tests)