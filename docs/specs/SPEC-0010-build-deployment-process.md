---
spec: SPEC-0010
title: Build and Deployment Process
status: draft
created: 2025-01-19
updated: 2025-01-19
authors: [Fractary Team]
---

# Build and Deployment Process

## Overview

The build and deployment process transforms universal concept definitions into framework-specific deployments, applying overlays and resolving dependencies.

## Build Pipeline

### 1. Load Base Definition

- Load concept metadata (agent.yml, tool.yml, etc.)
- Load prompt, tasks, flows, contexts
- Parse platform declarations

### 2. Discover and Apply Overlays

- Load organization overlays (.faber/overlays/organization/)
- Load platform overlays (.faber/overlays/platforms/{platform}/)
- Load concept overlays (.faber/overlays/{concept-type}/{name}/)
- Load team overlays (.faber/overlays/teams/{team}/) if applicable

### 3. Merge Configurations

- Load base config (.faber/config.yml)
- Apply organization config overlays
- Apply platform config overlays
- Apply concept config overlays
- Resolve final configuration (overlay precedence)

### 4. Resolve Platform and MCP

- Detect configured platform (from config)
- Load platform context
- Parse MCP server reference from platform context
- Resolve MCP server config (from config.mcp_servers)
- Validate MCP server availability

### 5. Collect Contexts

- Base contexts (from concept/contexts/)
- Organization overlay contexts
- Platform overlay contexts
- Concept overlay contexts
- Custom injected contexts (from config)

### 6. Resolve Binding

- Check for custom binding (concept/bindings/{framework}.binding.yml)
- Load built-in binding (src/bindings/{framework}/default.binding.yml)
- Merge if custom extends built-in
- Validate binding supports concept type

### 7. Prepare Template Data

- Collect all metadata
- Prepare context list (base + overlays)
- Build variable object for templates
- Resolve path templates

### 8. Execute Transformation

- Process templates with Handlebars
- Run pre-process hooks (if any)
- Generate framework-specific files
- Run post-process hooks (if any)

### 9. Write Deployment Artifacts

- Write agent/tool/eval files to output paths
- Copy all contexts (preserving category structure)
- Copy overlay contexts to _overlays/ directory
- Write merged configuration
- Include MCP server configs
- Update context reference paths for deployment

## Deployment Structure

```
deployments/{framework}/
  .claude/                        # or framework-specific dir
    agents/{org}/{system}/
      {name}.md
    tools/{org}/{system}/
      {name}.json

  .faber/
    config.yml                    # Merged configuration

  docs/
    agents/{org}/{system}/{name}/
      contexts/
        specialists/
        platforms/
        standards/
        patterns/
        playbooks/
        references/
        troubleshooting/

        _overlays/               # Overlay contexts (separated)
          organization/
          platform/
          role/
```

## Build Commands

### Build All Concepts for Framework

```bash
faber build claude
```

Builds all concepts (roles, tools, evals, teams, workflows) for Claude Code.

### Build Specific Concept Type

```bash
faber build claude roles
```

Builds all roles for Claude Code.

### Build Specific Concept

```bash
faber build claude role issue-manager
```

Builds only the issue-manager role for Claude Code.

### Build with Output Path

```bash
faber build claude role issue-manager --output ./custom-output
```

## Validation During Build

Build process validates:
- Concept metadata schema
- Platform declarations vs available platform contexts
- MCP server references vs configured MCP servers
- Context references (all referenced contexts exist)
- Task/flow references
- Binding configuration
- Overlay structure and references

## Incremental Builds

Future: Support incremental builds (only rebuild changed concepts)

## References

- [SPEC-0006: Binding System](./SPEC-0006-binding-system.md)
- [SPEC-0007: Overlay System](./SPEC-0007-overlay-system.md)
- [SPEC-0011: Claude Code Binding](./SPEC-0011-claude-code-binding.md)
