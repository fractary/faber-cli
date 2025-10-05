---
spec: SPEC-0008
title: Configuration System
status: draft
created: 2025-01-19
updated: 2025-01-19
authors: [Fractary Team]
---

# Configuration System

## Overview

The configuration system manages platform selections, MCP server configurations, overlay settings, and framework preferences through `.faber/config.yml` and concept-specific config overlays.

## Schema

### .faber/config.yml

```yaml
# Platform configurations (concept → platform mapping)
platforms:
  {concept-name}: string        # e.g., issue-manager: linear

# MCP server configurations
mcp_servers:
  {server-name}:
    enabled: boolean
    source: "local" | "npm" | "github"
    path: string                # if local
    package: string             # if npm
    version: string             # if npm
    repository: string          # if github
    config:
      # Server-specific configuration
      api_key: string
      server_url: string

# Global settings
settings:
  organization: string
  environment: string           # dev | staging | production

# Framework settings
frameworks:
  {framework-name}:
    # Framework-specific settings
```

### Example Configuration

```yaml
platforms:
  issue-manager: linear
  repo-manager: github
  ci-manager: github-actions

mcp_servers:
  mcp-server-linear:
    enabled: true
    source: npm
    package: "@company/mcp-server-linear"
    version: "^1.0.0"
    config:
      api_key: ${LINEAR_API_KEY}
      workspace: acme-engineering

  mcp-server-github:
    enabled: true
    source: npm
    package: "@modelcontextprotocol/server-github"
    version: "^0.5.0"
    config:
      auth_method: gh_cli

settings:
  organization: acme-corp
  environment: production

frameworks:
  claude:
    auto_activate: true
```

## References

- [SPEC-0005: Platform Abstraction](./SPEC-0005-platform-abstraction.md)
- [SPEC-0007: Overlay System](./SPEC-0007-overlay-system.md)
- [SPEC-0012: MCP Server Integration](./SPEC-0012-mcp-server-integration.md)
