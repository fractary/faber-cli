---
spec: SPEC-0001
title: Faber-CLI Overview and Architecture
status: draft
created: 2025-01-19
updated: 2025-01-19
authors: [Fractary Team]
implementation_status: partial
implementation_notes: |
  Core architecture implemented. TypeScript project structure, concept system,
  context system, overlay system, configuration system, and Claude Code binding complete.
  Missing: Additional bindings (LangGraph, CrewAI), marketplace/registry, visual designer.
---

# Faber-CLI Overview and Architecture

## Overview

Faber-CLI is a universal AI agent orchestration platform that enables defining AI agents, tools, teams, and workflows in a single universal format that can be deployed across multiple AI frameworks and adapted to different platforms and organizational contexts.

The core innovation is **write-once, customize-anywhere, deploy-everywhere** orchestration definitions through three-dimensional abstraction:
1. **Framework Abstraction**: Deploy to any AI framework (Claude Code, LangGraph, CrewAI)
2. **Platform Abstraction**: Work with any platform/tool (GitHub, GitLab, Linear, Jira, AWS, GCP)
3. **Organization Abstraction**: Customize for company/instance without forking

## Motivation

### The Problem

Current AI agent development faces several challenges:

1. **Framework Lock-in**: Agents written for Claude Code don't work in LangGraph; agents for CrewAI don't work in AutoGen
2. **Platform Coupling**: Agents hardcoded for GitHub don't work with GitLab; agents for Jira don't work with Linear
3. **Customization Requires Forking**: Organizations must fork agent code to inject company standards, leading to:
   - Maintenance burden (upstream updates require manual merging)
   - Divergence from source (customizations become incompatible)
   - Duplication (same customization across multiple agents)

### The Solution

Faber-CLI provides:

1. **Universal Agent Definitions**: Define agents once in a standard format
2. **Pluggable Bindings**: Transform to any framework via bindings
3. **Platform Contexts**: Adapt to any platform via context switching
4. **Overlay System**: Customize without modifying source via overlays

## Key Design Principles

### 1. Write Once, Run Anywhere

Define orchestration concepts (roles, tools, evals, teams, workflows) in a universal format that works across all frameworks and platforms.

### 2. Convention over Configuration

Sensible defaults and conventions work for 80-90% of use cases. Customization available when needed.

### 3. Separation of Concerns

- **Base definitions**: Generic, platform-agnostic, framework-agnostic
- **Platform contexts**: Platform-specific knowledge (ideally via MCP)
- **Overlays**: Organization-specific customizations
- **Bindings**: Framework-specific transformations

### 4. Composability

- Contexts compose (specialist + platform + standards + overlay)
- Roles compose into teams
- Teams compose into workflows
- Overlays compose at multiple levels

### 5. No-Fork Customization

Organizations customize agents via overlays without modifying source, enabling:
- Easy upstream updates (no merge conflicts)
- Separation of generic vs company-specific
- Reusable customizations across agents

### 6. Platform-First via MCP

Platform integration prefers Model Context Protocol (MCP) servers for:
- Clean abstraction of platform APIs
- Reusable across agents and frameworks
- Standard protocol for tool integration

### 7. Minimal Deployments

Deployment artifacts stay minimal. Intelligence lives in contexts (base + overlay) loaded dynamically.

## Three-Dimensional Abstraction

### Dimension 1: Framework Abstraction (Bindings)

**Problem**: Different AI frameworks need different formats.

**Solution**: Bindings transform universal definitions → framework-specific deployments.

**Mechanisms**:
- Built-in bindings for common frameworks (Claude Code, LangGraph, CrewAI)
- Custom bindings for edge cases (per-role overrides)
- Template-based transformation
- Pluggable binding system

**Example**:
```
Universal Role Definition (issue-manager)
    ↓
[Binding: Claude Code] → .claude/agents/issue-manager.md
[Binding: LangGraph]   → langgraph/graphs/issue_manager.py
[Binding: CrewAI]      → crewai/agents/issue_manager_agent.py
```

### Dimension 2: Platform Abstraction (Platform Contexts + MCP)

**Problem**: Same agent needs to work with different platforms (GitHub vs GitLab, Linear vs Jira).

**Solution**: Platform contexts provide platform-specific knowledge, ideally wrapping MCP servers.

**Mechanisms**:
- Platform contexts as lightweight MCP adapters
- Config-driven platform selection
- Generic tasks map to platform-specific operations
- Fallback to direct API/CLI when no MCP available

**Example**:
```
Universal Task: "Create issue"
    ↓
Platform Detection (from config): Linear
    ↓
Load Platform Context: platform-linear.md
    ↓
Context References: mcp-server-linear
    ↓
MCP Tool Call: linear_create_issue
```

### Dimension 3: Organization Abstraction (Overlays)

**Problem**: Organizations need to customize agents with company standards, product docs, specific configs.

**Solution**: Overlay system allows injecting custom context/config without modifying source.

**Mechanisms**:
- Overlay directories mirroring base structure
- Cascading overlay resolution (org → platform → role → team)
- Config merging with precedence
- Context composition (base + overlays)

**Example**:
```
Base Role: issue-manager (generic)
    ↓
Organization Overlay: company-coding-standards.md
    ↓
Platform Overlay: company-linear-workspace.md
    ↓
Role Overlay: company-issue-templates.md
    ↓
Deployed Agent: company-customized issue-manager
```

## High-Level Architecture

### Project Structure

```
faber-cli project:
  .faber/
    config.yml                    # Platform + MCP + overlay config
    overlays/                     # Organization customizations
      organization/               # Applies to all
      platforms/{name}/           # Platform-specific
      roles/{name}/               # Role-specific
      teams/{name}/               # Team-specific

  roles/                          # Agent role definitions
    {role-name}/
      agent.yml                   # Metadata + platform declarations
      prompt.md                   # Core prompt + overlay loading
      tasks/                      # Platform-agnostic atomic tasks
      flows/                      # Platform-agnostic workflows
      contexts/                   # Dynamic context library
        specialists/              # Expertise contexts
        platforms/                # Platform-specific (MCP adapters)
        standards/                # Best practices
        patterns/                 # Design patterns
        playbooks/                # Operational procedures
        references/               # API/framework docs
        troubleshooting/          # Issue resolution
      bindings/                   # Custom binding overrides (optional)

  tools/                          # MCP servers and utilities
  evals/                          # Evaluation scenarios
  teams/                          # Multi-agent teams
  workflows/                      # Cross-team workflows

  deployments/                    # Generated artifacts
    claude/
    langgraph/
    crewai/
```

### Core Concepts

Faber-CLI manages five first-class concepts:

1. **Roles**: AI agent definitions with contexts and tasks
2. **Tools**: MCP servers and utilities
3. **Evals**: Testing and evaluation scenarios
4. **Teams**: Multi-agent compositions
5. **Workflows**: Cross-team orchestrations

Each concept:
- Has a metadata file (agent.yml, tool.yml, eval.yml, team.yml, workflow.yml)
- Can be customized via overlays
- Can be deployed to multiple frameworks via bindings
- Supports platform abstraction where applicable

### Build and Deployment Flow

```
1. Load Base Definition
   - Read concept metadata (agent.yml, etc.)
   - Load base contexts

2. Discover and Apply Overlays
   - Organization overlays
   - Platform overlays
   - Concept-specific overlays
   - Merge configurations

3. Resolve Platform and MCP
   - Detect configured platform
   - Load platform context
   - Resolve MCP server dependencies

4. Transform via Binding
   - Load binding (built-in or custom)
   - Apply transformation templates
   - Generate framework-specific code

5. Generate Deployment
   - Write framework artifacts
   - Include all contexts (base + overlays)
   - Include MCP server configs
   - Update reference paths
```

## Target Users and Use Cases

### Individual Developers
- Rapid prototyping of AI agents
- Framework experimentation (Claude vs LangGraph)
- Platform flexibility (switch GitHub ↔ GitLab)

### Open Source Projects
- Distribute reusable agent roles
- Community contributions
- Multi-framework support

### Organizations
- Inject company standards without forking
- Consistent agents across teams
- Platform standardization (org uses Linear)
- Environment variations (dev/staging/prod)

### Platform Vendors
- Provide standard agent definitions for their platform
- MCP server + platform context bundles
- Example agents for common workflows

## Key Differentiators

### vs. Framework-Specific Agents
- **Faber-CLI**: Define once, deploy to any framework
- **Framework-Specific**: Rewrite for each framework

### vs. Hardcoded Platform Integration
- **Faber-CLI**: Platform contexts + MCP, config-driven
- **Hardcoded**: If/else blocks, tight coupling

### vs. Forked Customization
- **Faber-CLI**: Overlay system, merge-free updates
- **Forked**: Manual merging, divergence

### vs. Single-Purpose Tools
- **Faber-CLI**: Roles + Tools + Evals + Teams + Workflows
- **Single-Purpose**: Only one concept type

## Technical Foundation

### Distribution
- **Public npm package**: `@fractary/faber`
- **Open source**: MIT license
- **Standard installation**: `npm install -g @fractary/faber`

### Technology Stack
- **Runtime**: Node.js 18+
- **Language**: TypeScript with strict mode
- **CLI Framework**: Commander.js
- **Validation**: JSON Schema (Ajv)
- **Templates**: Handlebars
- **Config**: YAML (cosmiconfig)

### Extensibility Points

1. **Custom Bindings**: Add new framework support
2. **MCP Servers**: Add new platform integrations
3. **Overlays**: Customize at any level
4. **Custom Contexts**: Inject specialized knowledge

## Success Metrics

1. **Developer Experience**
   - Time to first agent: < 5 minutes
   - Framework switch: < 1 minute
   - Platform switch: Config change only
   - Company customization: No source edits

2. **Adoption**
   - Multiple frameworks supported
   - Multiple platforms supported
   - Community contributions
   - Enterprise usage

3. **Quality**
   - Test coverage > 80%
   - Type safety (strict TypeScript)
   - Comprehensive validation
   - Clear error messages

## Roadmap

### Phase 1: Foundation (v0.1)
- Core concept system (roles, tools)
- Context system
- Platform abstraction
- Claude Code binding

### Phase 2: Overlays (v0.2)
- Overlay system
- Configuration merging
- Organization customization

### Phase 3: Teams (v0.3)
- Team compositions
- Multi-agent coordination
- Team-level overlays

### Phase 4: Additional Bindings (v0.4+)
- LangGraph binding
- CrewAI binding
- AutoGen binding

### Phase 5: Enterprise (v1.0+)
- Workflow orchestrations
- Advanced evals
- Marketplace/registry
- Visual designer

## References

- [SPEC-0002: Concept System](./SPEC-0002-concept-system.md)
- [SPEC-0003: Role Structure](./SPEC-0003-role-structure.md)
- [SPEC-0004: Context System](./SPEC-0004-context-system.md)
- [SPEC-0005: Platform Abstraction](./SPEC-0005-platform-abstraction.md)
- [SPEC-0006: Binding System](./SPEC-0006-binding-system.md)
- [SPEC-0007: Overlay System](./SPEC-0007-overlay-system.md)
- Model Context Protocol: https://modelcontextprotocol.io
- Reference Implementation: faber-agents-forge repository
