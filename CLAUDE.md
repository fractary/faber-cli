# Fractary CLI Development Guide for Claude

This document provides critical context and implementation guidance for developing the unified Fractary CLI.

## Project Overview

**Fractary CLI** (`@fractary/cli`) is a unified command-line interface for all Fractary tools:
- **faber** - Universal AI agent orchestration (write-once, deploy-everywhere)
- **codex** - Centralized knowledge management and distribution
- **forge** - [Coming soon]
- **helm** - [Coming soon]

## Command Pattern

All Fractary tools use the unified command pattern:
```bash
fractary <tool> <command> [options]
```

Examples:
```bash
fractary faber init
fractary faber create role my-agent
fractary faber build claude role my-agent
fractary codex init --org fractary
fractary codex validate docs/
fractary forge init
```

## Project Vision (Faber)

The **Faber** tool enables **write-once, deploy-everywhere** AI agent definitions through three-dimensional abstraction:
1. **Framework Abstraction**: Deploy to any AI framework (Claude Code, LangGraph, CrewAI)
2. **Platform Abstraction**: Work with any platform (GitHub, GitLab, Linear, Jira, AWS, GCP)
3. **Organization Abstraction**: Customize for company/instance without forking

## Architecture Overview

### Core Concepts (Five First-Class Types)

1. **Roles**: AI agent definitions with contexts, tasks, flows
2. **Tools**: MCP servers and utilities
3. **Evals**: Testing and evaluation scenarios
4. **Teams**: Multi-agent compositions
5. **Workflows**: Cross-team orchestrations

### Key Design Principles

- **Convention over Configuration**: Sensible defaults for 80-90% of use cases
- **Separation of Concerns**: Base definitions vs platform contexts vs overlays vs bindings
- **Composability**: Contexts, roles, teams, and workflows all compose
- **No-Fork Customization**: Organizations customize via overlays without modifying source
- **Platform-First via MCP**: Prefer MCP servers for platform integration
- **Minimal Deployments**: Intelligence lives in dynamically loaded contexts

## Project Structure

```
fractary-cli/
├── src/                        # TypeScript source code
│   ├── cli.ts                  # Main CLI entry with tool routing
│   ├── tools/                  # Tool-specific commands
│   │   ├── faber/             # Faber commands
│   │   │   ├── init.ts
│   │   │   ├── create.ts
│   │   │   ├── build.ts
│   │   │   ├── list.ts
│   │   │   └── validate.ts
│   │   ├── forge/             # Forge commands (coming soon)
│   │   ├── helm/              # Helm commands (coming soon)
│   │   └── codex/             # Codex commands (coming soon)
│   └── shared/                 # Shared utilities
├── docs/
│   ├── conversations/          # Session summaries
│   └── specs/                  # Complete specifications (faber)
├── test/                       # Test suite
└── examples/                   # Example concepts
```

## Related Packages

This CLI depends on core SDK packages for each tool:

- **@fractary/faber** - Core SDK for faber (published to npm)
  - Contains: loaders, bindings, transformers, types
  - Location: `/mnt/c/GitHub/fractary/faber/`
  - No CLI functionality (library only)

- **@fractary/codex** - Core SDK for codex (published to npm)
  - Contains: metadata parsing, pattern matching, routing, configuration
  - Location: `/mnt/c/GitHub/fractary/codex/`
  - Specification: See SPEC-0013

- **@fractary/forge** - Core SDK for forge (coming soon)
- **@fractary/helm** - Core SDK for helm (coming soon)

## Implementation Phases

### Phase 1: Core Infrastructure (Priority)
1. **Concept System** (SPEC-0002): Load and validate five concept types
2. **Context System** (SPEC-0004): Dynamic context loading with categories
3. **Role Structure** (SPEC-0003): Complete role anatomy
4. **Platform Abstraction** (SPEC-0005): Platform contexts as MCP adapters

### Phase 2: Customization & Building
5. **Overlay System** (SPEC-0007): Organization customization without forking
6. **Configuration System** (SPEC-0008): Platform selection and MCP config
7. **Binding System** (SPEC-0006): Framework transformation pipeline
8. **Claude Code Binding** (SPEC-0011): First binding implementation

### Phase 3: CLI & Deployment
9. **CLI Commands** (SPEC-0009): User interface implementation
10. **Build Process** (SPEC-0010): End-to-end build pipeline
11. **MCP Integration** (SPEC-0012): MCP server management

## Critical Implementation Details

### Context System is Core Innovation

The context system enables agents to dynamically load specialized knowledge:

```typescript
// Seven context categories
enum ContextCategory {
  SPECIALIST = 'specialists',      // Expertise loaded on-demand
  PLATFORM = 'platforms',          // Platform-specific (MCP adapters)
  STANDARD = 'standards',          // Best practices
  PATTERN = 'patterns',            // Design patterns
  PLAYBOOK = 'playbooks',          // Operational procedures
  REFERENCE = 'references',        // API/framework docs
  TROUBLESHOOTING = 'troubleshooting' // Issue resolution
}
```

### Platform Contexts as MCP Adapters

Platform contexts are lightweight adapters around MCP servers:

```markdown
---
category: platform
platform: linear
mcp_server: mcp-server-linear
required_tools: [linear_create_issue, linear_update_issue]
---

# Linear Platform Context
[Maps generic tasks to Linear MCP tools]
```

### Overlay Resolution Order

Contexts load in cascading order (later overrides earlier):
1. Base concept contexts
2. Organization overlays
3. Platform overlays
4. Concept-specific overlays
5. Team overlays
6. Custom context injection

### Binding Transformation Pipeline

```typescript
// 1. Load base definition
// 2. Apply overlays
// 3. Resolve binding (custom or built-in)
// 4. Prepare template data
// 5. Execute transformation
// 6. Write deployment artifacts
```

## Development Patterns

### TypeScript Configuration

```typescript
// Use strict TypeScript
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

### Validation with JSON Schema

Use Ajv for YAML schema validation:

```typescript
import Ajv from 'ajv';
const ajv = new Ajv();
const validate = ajv.compile(schema);
```

### Template Processing

Use Handlebars for binding templates:

```typescript
import Handlebars from 'handlebars';
const template = Handlebars.compile(source);
const output = template(data);
```

### File System Operations

Always use async filesystem operations:

```typescript
import { promises as fs } from 'fs';
import path from 'path';
```

## Testing Strategy

### Unit Tests
- Test each concept loader/validator
- Test context resolution logic
- Test overlay merging
- Test binding transformations

### Integration Tests
- Test full build pipeline
- Test CLI commands
- Test MCP server integration

### Example Tests
Include example concepts for testing:
- `examples/roles/issue-manager/`
- `examples/tools/mcp-server-linear/`
- `examples/teams/release-team/`

## Common Pitfalls to Avoid

1. **Don't hardcode paths**: Use configurable path resolution
2. **Don't assume framework**: Check binding configuration
3. **Don't assume platform**: Check platform configuration
4. **Don't modify base**: Use overlays for customization
5. **Don't load all contexts**: Use lazy loading based on task

## Key Specifications to Reference

- **SPEC-0001**: Overall vision and architecture
- **SPEC-0002**: Five concept types and relationships
- **SPEC-0003**: Role structure details
- **SPEC-0004**: Context system (most critical)
- **SPEC-0007**: Overlay system for customization
- **SPEC-0011**: Claude Code binding specifics

## Implementation Checklist

### Core Components
- [ ] Concept loaders for all five types
- [ ] Context loader with category support
- [ ] Overlay resolver with cascading
- [ ] Platform detector from config
- [ ] Binding resolver and transformer
- [ ] Template engine integration
- [ ] Validation system with schemas
- [ ] CLI command structure
- [ ] Build pipeline orchestrator

### Claude Code Binding
- [ ] Agent frontmatter generator
- [ ] Context path rewriter
- [ ] Task/flow copier
- [ ] MCP config inclusion
- [ ] Deployment structure creator

### Testing
- [ ] Unit test suite
- [ ] Integration test suite
- [ ] Example concepts
- [ ] Validation test cases

## Build Commands

```bash
# Development
npm run dev              # Watch mode
npm run build            # Production build
npm run test             # Run tests
npm run lint             # Lint code
npm run typecheck        # Type checking

# CLI Testing
npm link                 # Link CLI globally
faber init               # Test init command
faber validate role issue-manager  # Test validation
faber build claude role issue-manager  # Test build
```

## Error Handling Patterns

```typescript
// Use descriptive error classes
class ConceptNotFoundError extends Error {
  constructor(type: ConceptType, name: string) {
    super(`${type} '${name}' not found`);
  }
}

// Provide helpful error messages
class ValidationError extends Error {
  constructor(concept: string, errors: string[]) {
    super(`Validation failed for ${concept}:\n${errors.join('\n')}`);
  }
}
```

## Next Steps

1. **Set up TypeScript project** with strict mode
2. **Implement concept loaders** starting with Role
3. **Implement context system** with seven categories
4. **Add overlay resolution** with cascading
5. **Create Claude Code binding** as first transformer
6. **Implement core CLI commands** (init, validate, build)
7. **Add comprehensive tests** for all components
8. **Create example concepts** for testing

## Questions to Resolve During Implementation

1. Should concepts support versioning (e.g., `version: "1.0.0"`)?
2. Should contexts support includes/partials?
3. Should there be a concept dependency visualization?
4. Should tasks support JSON schema parameter validation?
5. Should flows support conditional branching?

## Success Metrics

- Time to first agent: < 5 minutes
- Framework switch: < 1 minute
- Platform switch: Config change only
- Company customization: No source edits
- Test coverage: > 80%
- Type safety: Strict TypeScript

## Resources

- Model Context Protocol: https://modelcontextprotocol.io
- Reference Implementation: faber-agents-forge repository
- Handlebars: https://handlebarsjs.com
- Ajv: https://ajv.js.org
- Commander.js: https://github.com/tj/commander.js