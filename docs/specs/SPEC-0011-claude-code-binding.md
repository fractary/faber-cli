---
spec: SPEC-0011
title: Claude Code Binding Specification
status: draft
created: 2025-01-19
updated: 2025-01-19
authors: [Fractary Team]
implementation_status: complete
implementation_notes: |
  Fully implemented. Claude Code transformer with Handlebars templates,
  proper output structure, context copying, overlay separation, and
  MCP server configuration inclusion all working.
---

# Claude Code Binding Specification

## Overview

The Claude Code binding transforms universal role definitions into Claude Code-compatible agent files in the `.claude/agents/` directory format.

## Output Structure

```
deployments/claude/
  .claude/
    agents/{org}/{system}/
      {role-name}.md           # Agent definition

  docs/agents/{org}/{system}/{role-name}/
    contexts/                  # All contexts (base + overlays)
      specialists/
      platforms/
      standards/
      patterns/
      playbooks/
      references/
      troubleshooting/
      _overlays/              # Overlay contexts separated

    tasks/                    # Task definitions
    flows/                    # Flow definitions

  .faber/
    config.yml                # Merged configuration
```

## Agent File Format

```markdown
---
org: {org}
system: {system}
name: {name}
description: |
  {description}

color: {color}
tags: [{tags}]
---

{prompt content from prompt.md}

## Available Contexts

Base contexts: `/docs/agents/{org}/{system}/{name}/contexts/`
Overlay contexts: `/docs/agents/{org}/{system}/{name}/contexts/_overlays/`

## Available Tasks

{list of tasks}

## Available Flows

{list of flows}
```

## Binding Configuration

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

path_resolution:
  context_prefix: "/docs/agents/{org}/{system}/{name}/contexts/"
  task_prefix: "/docs/agents/{org}/{system}/{name}/tasks/"
  flow_prefix: "/docs/agents/{org}/{system}/{name}/flows/"

framework_specific:
  preserve_context_structure: true
  include_mcp_config: true
```

## Transformation Steps

1. Generate agent frontmatter from agent.yml
2. Include prompt.md content as body
3. Update context paths to deployment paths
4. Copy all contexts to docs/ directory
5. Copy tasks and flows
6. Generate merged config.yml
7. Include MCP server connection info

## References

- [SPEC-0003: Role Structure](./SPEC-0003-role-structure.md)
- [SPEC-0006: Binding System](./SPEC-0006-binding-system.md)
- [SPEC-0010: Build and Deployment](./SPEC-0010-build-deployment-process.md)
