---
spec: SPEC-0006
title: Binding System - Framework Abstraction
status: draft
created: 2025-01-19
updated: 2025-01-19
authors: [Fractary Team]
---

# Binding System - Framework Abstraction

## Overview

The binding system enables deploying universal role definitions to multiple AI frameworks (Claude Code, LangGraph, CrewAI, etc.) through pluggable transformers. Bindings convert the universal format into framework-specific code while preserving all contexts and overlays.

## Motivation

Different AI frameworks have different requirements:
- **Claude Code**: Markdown agents in `.claude/agents/`
- **LangGraph**: Python StateGraph classes
- **CrewAI**: Python Agent/Crew classes
- **AutoGen**: ConversableAgent configurations

Writing roles multiple times creates maintenance burden and divergence. Bindings solve this by **writing once, transforming many times**.

## Design

### Binding Architecture

```
Universal Role Definition
    ↓
[Binding Configuration] (built-in or custom)
    ↓
[Template Engine] (Handlebars)
    ↓
[Transformation Logic]
    ↓
Framework-Specific Deployment
```

### Binding Types

#### 1. Built-in Bindings

**Location**: `src/bindings/{framework}/` in faber-cli

**Purpose**: Default transformations for common frameworks, work for 80-90% of cases.

**Structure**:
```
src/bindings/
  claude-code/
    default.binding.yml      # Configuration
    templates/               # Handlebars templates
      agent-frontmatter.hbs
      agent-body.hbs
      tool-config.hbs
    transformer.ts           # Transformation logic
  langgraph/
    default.binding.yml
    templates/
    transformer.ts
```

#### 2. Custom Bindings

**Location**: `{concept}/{name}/bindings/{framework}.binding.yml`

**Purpose**: Role-specific overrides for edge cases.

**Example**: `roles/special-agent/bindings/claude.binding.yml`

###  Binding Configuration Schema

```yaml
# Binding identity
name: string                      # e.g., "claude-code"
version: string                   # e.g., "1.0.0"
extends: string                   # Optional: extend another binding

# Supported concept types
concept_types: string[]           # [role, tool, eval, team, workflow]

# Output structure (template paths)
output_structure:
  role_path: string               # e.g., ".claude/agents/{org}/{system}/{name}.md"
  tool_path: string               # e.g., ".claude/tools/{org}/{system}/{name}.json"
  eval_path: string
  team_path: string
  workflow_path: string
  docs_path: string               # e.g., "docs/agents/{org}/{system}/{name}"
  config_path: string             # e.g., ".faber/config.yml"

# Templates
templates:
  role_frontmatter: string        # Path to frontmatter template
  role_body: string               # Path to body template
  tool_config: string             # Path to tool config template
  custom: object                  # Framework-specific templates

# Path resolution for deployed contexts
path_resolution:
  context_prefix: string          # e.g., "/docs/agents/{org}/{system}/{name}/contexts/"
  task_prefix: string
  flow_prefix: string

# Transformation hooks
transforms:
  pre_process: string[]           # Scripts to run before transformation
  post_process: string[]          # Scripts to run after transformation

# Framework-specific configuration
framework_specific: object
```

### Binding Resolution Priority

```
1. Check: {concept}/{name}/bindings/{framework}.binding.yml (custom)
2. Fallback: src/bindings/{framework}/default.binding.yml (built-in)
3. Merge: Custom extends/overrides default
```

### Template System

Bindings use **Handlebars** for template processing.

**Available Variables**:
```handlebars
{{org}}                  # Organization
{{system}}               # System
{{name}}                 # Concept name
{{type}}                 # Concept type
{{description}}          # Description
{{platforms}}            # Array of platforms
{{default_platform}}     # Default platform
{{config}}               # Merged configuration
{{contexts}}             # Array of contexts (base + overlays)
{{tasks}}                # Array of tasks
{{flows}}                # Array of flows
```

### Claude Code Binding Example

**File**: `src/bindings/claude-code/default.binding.yml`

```yaml
name: claude-code
version: 1.0.0

concept_types:
  - role
  - tool
  - eval

output_structure:
  role_path: ".claude/agents/{org}/{system}/{name}.md"
  tool_path: ".claude/tools/{org}/{system}/{name}.json"
  eval_path: ".claude/commands/{org}/{system}/{name}.md"
  docs_path: "docs/agents/{org}/{system}/{name}"
  config_path: ".faber/config.yml"

templates:
  role_frontmatter: "templates/agent-frontmatter.hbs"
  role_body: "templates/agent-body.hbs"
  tool_config: "templates/tool-config.hbs"

path_resolution:
  context_prefix: "/docs/agents/{org}/{system}/{name}/contexts/"
  task_prefix: "/docs/agents/{org}/{system}/{name}/tasks/"
  flow_prefix: "/docs/agents/{org}/{system}/{name}/flows/"

transforms:
  pre_process: []
  post_process: []

# Claude-specific settings
framework_specific:
  preserve_context_structure: true
  include_mcp_config: true
```

**Template**: `templates/agent-frontmatter.hbs`

```handlebars
---
org: {{org}}
system: {{system}}
name: {{name}}
description: |
  {{description}}

{{#if platforms}}
  Supports platforms: {{#each platforms}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}

{{#if examples}}
  {{examples}}
{{/if}}

color: {{color}}
tags: [{{#each tags}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}]
---
```

**Template**: `templates/agent-body.hbs`

```handlebars
{{{prompt}}}

## Deployed Contexts

Base contexts available at:
{{#each context_categories}}
- `{{../path_resolution.context_prefix}}{{this}}/`
{{/each}}

{{#if overlay_contexts}}
Overlay contexts available at:
{{#each overlay_contexts}}
- `{{this}}`
{{/each}}
{{/if}}
```

### Build Process with Bindings

```
1. Load Base Definition
   - Load role metadata (agent.yml)
   - Load prompt, tasks, flows, contexts

2. Apply Overlays
   - Load organization overlays
   - Load platform overlays
   - Load role overlays
   - Merge configurations

3. Resolve Binding
   - Check for custom binding
   - Load built-in binding (if no custom)
   - Merge if custom extends built-in

4. Prepare Template Data
   - Collect all contexts (base + overlays)
   - Resolve platform and MCP dependencies
   - Build variable object for templates

5. Execute Transformation
   - Process templates with Handlebars
   - Run pre-process hooks
   - Generate framework-specific files
   - Run post-process hooks

6. Write Deployment Artifacts
   - Write agent files to output paths
   - Copy all contexts (preserving structure)
   - Write merged configuration
   - Include MCP server configs
```

### Custom Binding Override Example

**File**: `roles/issue-manager/bindings/claude.binding.yml`

```yaml
# Extend default Claude binding
name: claude-code
version: 1.0.0
extends: default

# Override output path for this role
output_structure:
  role_path: ".claude/custom-agents/{name}.md"

# Add additional files
additional_files:
  - source: "scripts/linear-helper.sh"
    dest: ".claude/scripts/{name}-helper.sh"

# Custom template variables
template_vars:
  auto_activate: true
  priority: high
```

### Multi-Framework Example

Same role deployed to three frameworks:

**Claude Code Output**:
```
deployments/claude/
  .claude/
    agents/fractary/devops/
      issue-manager.md
  docs/agents/fractary/devops/issue-manager/
    contexts/
    tasks/
    flows/
```

**LangGraph Output** (future):
```
deployments/langgraph/
  graphs/
    issue_manager.py           # StateGraph definition
  nodes/
    create_issue_node.py
    assign_issue_node.py
  contexts/
    [contexts copied]
```

**CrewAI Output** (future):
```
deployments/crewai/
  agents/
    issue_manager_agent.py     # Agent class
  tools/
    issue_tools.py
  contexts/
    [contexts copied]
```

## Transformer Implementation

### Transformer Interface

```typescript
interface Binding {
  name: string;
  version: string;
  config: BindingConfig;

  // Transform concept to deployment
  transform(concept: Concept, config: Config, overlays: Overlays): DeploymentArtifact;

  // Validate binding can handle concept
  validate(concept: Concept): ValidationResult;

  // Resolve merged config
  resolveConfig(customConfig?: BindingConfig): BindingConfig;
}

interface DeploymentArtifact {
  files: Map<string, string>;      // path → content
  directories: string[];             // directories to create
  metadata: DeploymentMetadata;
}
```

### Example Transformer

```typescript
class ClaudeCodeBinding implements Binding {
  name = 'claude-code';
  version = '1.0.0';

  async transform(role: Role, config: Config, overlays: Overlays): Promise<DeploymentArtifact> {
    // 1. Merge configurations
    const mergedConfig = this.mergeConfig(role, config, overlays);

    // 2. Collect contexts
    const contexts = this.collectContexts(role, overlays);

    // 3. Prepare template data
    const templateData = {
      org: role.metadata.org,
      system: role.metadata.system,
      name: role.metadata.name,
      description: role.metadata.description,
      prompt: role.prompt,
      contexts,
      config: mergedConfig,
      ...this.config.template_vars
    };

    // 4. Generate agent file
    const agentContent = this.generateAgentFile(templateData);
    const agentPath = this.resolvePath(this.config.output_structure.role_path, templateData);

    // 5. Collect all files
    const files = new Map();
    files.set(agentPath, agentContent);

    // 6. Copy contexts
    for (const context of contexts) {
      const contextPath = this.resolveContextPath(context, templateData);
      files.set(contextPath, context.content);
    }

    // 7. Copy configuration
    const configPath = this.config.output_structure.config_path;
    files.set(configPath, YAML.stringify(mergedConfig));

    return {
      files,
      directories: this.collectDirectories(files),
      metadata: { binding: this.name, version: this.version }
    };
  }

  private generateAgentFile(data: any): string {
    const frontmatter = this.renderTemplate('role_frontmatter', data);
    const body = this.renderTemplate('role_body', data);
    return `${frontmatter}\n\n${body}`;
  }

  private renderTemplate(name: string, data: any): string {
    const templatePath = this.config.templates[name];
    const template = Handlebars.compile(fs.readFileSync(templatePath, 'utf-8'));
    return template(data);
  }
}
```

### Binding Registry

```typescript
class BindingRegistry {
  private bindings: Map<string, Binding> = new Map();

  register(binding: Binding): void {
    this.bindings.set(binding.name, binding);
  }

  get(name: string): Binding | undefined {
    return this.bindings.get(name);
  }

  listAll(): Binding[] {
    return Array.from(this.bindings.values());
  }

  async loadBuiltInBindings(): Promise<void> {
    const bindingsDir = path.join(__dirname, '../bindings');
    const frameworks = await fs.readdir(bindingsDir);

    for (const framework of frameworks) {
      const binding = await this.loadBinding(path.join(bindingsDir, framework));
      this.register(binding);
    }
  }
}
```

## Validation Rules

1. **Binding config valid**: YAML schema validation
2. **Templates exist**: All referenced templates must exist
3. **Concept type support**: Binding must support concept type
4. **Path variables valid**: All path templates must have valid variables
5. **No circular extends**: Custom bindings can't circularly extend

## Future Bindings

### LangGraph Binding

**Output**: Python StateGraph with nodes/edges

**Key Transformations**:
- Tasks → Node functions
- Flows → State transitions
- Contexts → Loaded as resources
- MCP tools → Tool definitions

### CrewAI Binding

**Output**: Crew/Agent Python classes

**Key Transformations**:
- Roles → Agent classes
- Tasks → Task classes
- Teams → Crew compositions
- Tools → CrewAI Tool wrappers

### AutoGen Binding

**Output**: ConversableAgent configurations

**Key Transformations**:
- Roles → Agent configs
- Tasks → Agent capabilities
- Tools → Function definitions

## Open Questions

1. Should bindings support hot-reloading (rebuild on file change)?
2. Should there be a binding validator tool?
3. Should bindings support incremental builds (only changed files)?
4. Should there be a binding marketplace/registry?

## References

- [SPEC-0003: Role Structure](./SPEC-0003-role-structure.md)
- [SPEC-0007: Overlay System](./SPEC-0007-overlay-system.md)
- [SPEC-0010: Build and Deployment](./SPEC-0010-build-deployment-process.md)
- [SPEC-0011: Claude Code Binding](./SPEC-0011-claude-code-binding.md)
