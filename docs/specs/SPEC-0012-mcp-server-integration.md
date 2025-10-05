---
spec: SPEC-0012
title: MCP Server Integration
status: draft
created: 2025-01-19
updated: 2025-01-19
authors: [Fractary Team]
implementation_status: not_implemented
implementation_notes: |
  MCP server configuration structure defined and validated, but actual
  MCP server launching, communication, and tool execution not implemented.
  This requires MCP protocol implementation.
---

# MCP Server Integration

## Overview

Model Context Protocol (MCP) servers provide the primary integration mechanism for platform operations. Platform contexts act as lightweight adapters around MCP servers, mapping generic tasks to platform-specific MCP tools.

## Architecture

```
Generic Task (platform-agnostic)
    ↓
Platform Context (MCP adapter)
    ↓
MCP Server (tool implementation)
    ↓
Platform API
```

## Platform Context → MCP Relationship

### Platform Context Responsibilities

1. Reference appropriate MCP server
2. Map generic concepts → platform terminology
3. Provide task → MCP tool mappings
4. Document platform-specific workflows
5. Handle platform limitations/workarounds

### MCP Server Responsibilities

1. Authenticate with platform API
2. Provide tool functions (create_issue, list_repos, etc.)
3. Handle API communication
4. Return structured data

## Platform Context with MCP Reference

**File**: `contexts/platforms/platform-linear.md`

```markdown
---
category: platform
platform: linear
mcp_server: mcp-server-linear      # References tool:mcp-server-linear
required_tools:
  - linear_create_issue
  - linear_update_issue
  - linear_list_issues
fallback: null                      # or "api" | "cli"
---

# Linear Platform Context

**MCP Server**: Use `mcp-server-linear` for all Linear operations.

## Available Tools (via MCP)

- `linear_create_issue` - Create new issue
- `linear_update_issue` - Update existing issue  
- `linear_list_issues` - List issues with filters

## Task Mappings

### Create Issue (from /tasks/create-issue.md)

**MCP Tool**: `linear_create_issue`

**Parameters**:
- title: string
- description: string
- teamId: string (from config)
- priority: number (1-4)

**Example**:
```javascript
await mcp.call('linear_create_issue', {
  title: "Bug in login",
  description: "Users can't login",
  teamId: "team_abc123",
  priority: 1
});
```
```

## MCP Server Configuration

**In .faber/config.yml**:

```yaml
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
```

## MCP Server Sources

### Local MCP Server

```yaml
mcp_servers:
  my-custom-server:
    enabled: true
    source: local
    path: ./tools/my-custom-server
    config:
      api_key: ${API_KEY}
```

### npm Package

```yaml
mcp_servers:
  mcp-server-linear:
    enabled: true
    source: npm
    package: "@company/mcp-server-linear"
    version: "^1.0.0"
```

### GitHub Repository

```yaml
mcp_servers:
  community-server:
    enabled: true
    source: github
    repository: "username/mcp-server-repo"
    version: "v1.0.0"
```

## Fallback Strategy

When no MCP server available, platform context specifies fallback:

```markdown
---
platform: jira
mcp_server: null
fallback: api                    # Use direct API calls
---

# Jira Platform Context

**NOTE**: No MCP server available. Use Jira REST API directly.

## Task Mappings

### Create Issue

**API Call**:
```python
from jira import JIRA
jira = JIRA(server='...', basic_auth=(...))
issue = jira.create_issue(project='PROJ', summary=title, ...)
```
```

## MCP Dependency Resolution

During build:

1. Parse platform context frontmatter for `mcp_server` reference
2. Look up MCP server in `.faber/config.yml -> mcp_servers`
3. Validate MCP server is enabled and configured
4. Include MCP server config in deployment
5. If MCP server missing, check `fallback` strategy

## Deployment with MCP

```
deployments/claude/
  .faber/
    config.yml               # Includes mcp_servers config

  docs/agents/{org}/{system}/{role}/
    contexts/
      platforms/
        platform-linear.md   # References MCP server
```

At runtime, agent:
1. Loads platform context
2. Sees `mcp_server: mcp-server-linear`
3. Connects to MCP server (via config)
4. Uses MCP tools for all operations

## MCP-First Philosophy

**Prefer MCP when available**:
- Standard protocol
- Reusable across frameworks
- Community-maintained
- Clean abstraction

**Fallback to API/CLI when necessary**:
- Document in platform context
- Provide implementation guidance
- Note limitations

## Available MCP Servers

| Platform | MCP Server | Package | Status |
|----------|------------|---------|--------|
| GitHub | @modelcontextprotocol/server-github | npm | Official |
| Linear | mcp-server-linear | npm/local | Community |
| Slack | @modelcontextprotocol/server-slack | npm | Official |
| GitLab | mcp-server-gitlab | Community | Community |

## MCP Server Tool Structure

**File**: `tools/mcp-server-linear/tool.yml`

```yaml
org: fractary
system: integrations
name: mcp-server-linear
type: tool
tool_type: mcp-server
mcp_server: true
protocols:
  - mcp
platforms:
  - nodejs
default_platform: nodejs
```

**Directory**:
```
tools/mcp-server-linear/
  tool.yml
  mcp/
    server.json           # MCP server manifest
    handlers/
      create-issue.ts     # Tool handler
      list-issues.ts
```

## References

- [SPEC-0005: Platform Abstraction](./SPEC-0005-platform-abstraction.md)
- [SPEC-0008: Configuration System](./SPEC-0008-configuration-system.md)
- Model Context Protocol: https://modelcontextprotocol.io
