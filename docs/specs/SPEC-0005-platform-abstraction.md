---
spec: SPEC-0005
title: Platform Abstraction via MCP and Platform Contexts
status: draft
created: 2025-01-19
updated: 2025-01-19
authors: [Fractary Team]
---

# Platform Abstraction via MCP and Platform Contexts

## Overview

Platform abstraction enables roles to work across different platforms (GitHub, GitLab, Linear, Jira, AWS, GCP, etc.) through a combination of platform contexts and Model Context Protocol (MCP) servers. Platform contexts act as lightweight adapters that map generic tasks to platform-specific operations, ideally via MCP tools.

## Motivation

### The Multi-Platform Problem

Organizations use diverse tools:
- **Issue Tracking**: GitHub Issues, Linear, Jira, Azure DevOps
- **Source Control**: GitHub, GitLab, Bitbucket, Azure Repos
- **CI/CD**: GitHub Actions, GitLab CI, Jenkins, CircleCI
- **Cloud**: AWS, GCP, Azure
- **Monitoring**: Datadog, New Relic, Prometheus

Hardcoding platform logic creates:
- **Platform lock-in**: Can't switch platforms
- **Code duplication**: Reimplement for each platform
- **Maintenance burden**: Update multiple implementations
- **Poor abstractions**: Leaky if/else blocks

### Platform Abstraction Solution

1. **Generic Tasks**: Define platform-agnostic operations
2. **Platform Contexts**: Map generic → platform-specific
3. **MCP Servers**: Provide platform integrations (preferred)
4. **Config-Driven**: Select platform via configuration
5. **Fallback Support**: Direct API/CLI when no MCP exists

## Design

### Architecture Layers

```
Generic Task Definition (in role/tasks/)
    ↓
Platform Detection (from .faber/config.yml)
    ↓
Platform Context Loading (contexts/platforms/platform-{name}.md)
    ↓
MCP Server Reference (if available)
    ↓
MCP Tool Execution OR Direct API/CLI (fallback)
    ↓
Platform-Specific Operation
```

### Platform Context as MCP Adapter

Platform contexts serve as **lightweight adapters** around MCP servers:

**Platform Context Responsibilities**:
1. Reference the appropriate MCP server
2. Map generic concepts → platform terminology
3. Provide task-to-MCP-tool mappings
4. Document platform-specific workflows
5. Handle platform limitations/workarounds

**MCP Server Responsibilities**:
1. Authenticate with platform API
2. Provide tool functions (create_issue, list_repos, etc.)
3. Handle API communication
4. Return structured data

### Platform Context Structure

**File**: `contexts/platforms/platform-{name}.md`

**Required Frontmatter**:
```yaml
---
category: platform
platform: string              # Platform identifier
mcp_server: string | null     # MCP server reference (tool:mcp-server-{name})
required_tools: string[]      # MCP tools this context uses
fallback: string              # "api" | "cli" | "manual" (if no MCP)
---
```

**Required Sections**:
1. **MCP Server Declaration**: Which MCP server to use
2. **Available Tools**: List MCP tools with descriptions
3. **Platform Concepts**: Terminology mapping
4. **Task Mappings**: How generic tasks map to platform operations
5. **Common Workflows**: Platform-specific workflow guidance
6. **Limitations & Workarounds**: Platform constraints
7. **Authentication**: How auth is handled

### Platform Detection and Selection

**Configuration**:
```yaml
# .faber/config.yml
platforms:
  issue-manager: linear      # This role uses Linear
  repo-manager: github       # This role uses GitHub
  ci-manager: github-actions # This role uses GitHub Actions
```

**In prompt.md**:
```markdown
## Platform Detection

1. Check `.faber/config.yml` for `platforms.{role-name}`
2. Load `/contexts/platforms/platform-{detected}.md`
3. Parse MCP server reference from context frontmatter
4. Configure MCP tools for use
5. If no platform configured, use `default_platform` from agent.yml
```

### Generic Task → Platform Mapping

**Generic Task** (platform-agnostic):
```markdown
# Create Issue

**Purpose**: Create a new issue in the configured issue tracking platform.

## Inputs
- title: string
- description: string
- labels: string[]
- priority: string

## Steps
1. Validate inputs
2. Determine team/project
3. Map priority to platform values
4. Create issue via platform
5. Return issue ID and URL
```

**Platform Context Mapping** (for Linear):
```markdown
### Create Issue (from /tasks/create-issue.md)

**MCP Tool**: `linear_create_issue`

**Mapping**:
- title → title (direct)
- description → description (direct)
- labels → labelIds (lookup label IDs from names)
- priority → priority (map: urgent=1, high=2, medium=3, low=4)

**Implementation**:
```javascript
// 1. Resolve team ID from config or context
const teamId = config.platforms.issue-manager.linear.default_team;

// 2. Map priority
const priorityMap = { urgent: 1, high: 2, medium: 3, low: 4 };
const linearPriority = priorityMap[priority];

// 3. Lookup label IDs (if labels provided)
const labelIds = await resolveLabelIds(labels);

// 4. Call MCP tool
const result = await mcp.call('linear_create_issue', {
  title,
  description,
  teamId,
  priority: linearPriority,
  labelIds
});

// 5. Return standardized format
return {
  issue_id: result.identifier,  // e.g., "ENG-123"
  url: result.url
};
```
```

**Platform Context Mapping** (for GitHub Issues):
```markdown
### Create Issue (from /tasks/create-issue.md)

**MCP Tool**: `github_create_issue`

**Mapping**:
- title → title (direct)
- description → body (GitHub calls it "body")
- labels → labels (array of label names)
- priority → labels (no native priority, use labels like "priority: high")

**Implementation**:
```javascript
// 1. Get repository from config
const repo = config.platforms.issue-manager.github.repository;

// 2. Map priority to label
const priorityLabel = `priority: ${priority}`;
const allLabels = [...labels, priorityLabel];

// 3. Call MCP tool
const result = await mcp.call('github_create_issue', {
  owner: repo.owner,
  repo: repo.name,
  title,
  body: description,
  labels: allLabels
});

// 4. Return standardized format
return {
  issue_id: result.number.toString(),  // e.g., "456"
  url: result.html_url
};
```
```

### MCP-First Philosophy

**Prefer MCP when available**:
- Clean abstraction
- Standard protocol
- Reusable across frameworks
- Community-maintained

**Fallback to API/CLI when necessary**:
- Document in platform context frontmatter: `fallback: api`
- Provide implementation guidance
- Note limitations

### Platform Context Examples

#### Example 1: Linear (with MCP)

**File**: `contexts/platforms/platform-linear.md`

```markdown
---
category: platform
platform: linear
mcp_server: mcp-server-linear
required_tools:
  - linear_create_issue
  - linear_update_issue
  - linear_list_issues
  - linear_list_cycles
fallback: null
---

# Linear Platform Context

**MCP Server**: Use `mcp-server-linear` for all Linear operations.

## Available Tools (via MCP)

- `linear_create_issue` - Create new issue
- `linear_update_issue` - Update existing issue
- `linear_list_issues` - List issues with filters
- `linear_list_cycles` - List cycles (sprints)
- `linear_list_teams` - List workspace teams

## Platform Concepts & Terminology

- **Issue** → Issue (same terminology)
- **Sprint** → Cycle (Linear calls it "cycle")
- **Label** → Label (built-in + custom labels)
- **Team** → Team (workspace subdivision)
- **Estimate** → Estimate (Fibonacci: 0.5, 1, 2, 3, 5, 8, 13, 21)
- **Priority** → Priority (0=None, 1=Urgent, 2=High, 3=Medium, 4=Low)

## Task Mappings

### Create Issue
[See mapping above]

### Assign Issue
**MCP Tool**: `linear_update_issue`
**Parameters**: `{issueId, assigneeId}`

### Plan Sprint
**Workflow**:
1. `linear_list_cycles` - Find active cycle
2. `linear_list_issues(filter: {state: "Backlog"})` - Get backlog
3. `linear_update_issue(issueId, {cycleId})` - Assign to cycle

## Authentication

MCP server handles authentication via Linear API token.
Ensure `LINEAR_API_KEY` is configured in .faber/config.yml or environment.
```

#### Example 2: Jira (no MCP, API fallback)

**File**: `contexts/platforms/platform-jira.md`

```markdown
---
category: platform
platform: jira
mcp_server: null
required_tools: []
fallback: api
---

# Jira Platform Context

**NOTE**: No MCP server available for Jira yet. Use Jira REST API directly via Python `jira` library.

## Available Operations (via API)

Use Python `jira` library:
```python
from jira import JIRA

jira = JIRA(
  server='https://your-domain.atlassian.net',
  basic_auth=(email, api_token)
)
```

## Platform Concepts & Terminology

- **Issue Types**: Epic, Story, Task, Bug, Subtask
- **Sprint** → Sprint (Jira Agile API)
- **Label** → Label + Component
- **Estimate** → Story Points (custom field)
- **Priority** → Priority (Highest, High, Medium, Low, Lowest)

## Task Mappings

### Create Issue

**API Call**:
```python
issue = jira.create_issue(
  project='PROJ',
  summary=title,
  description=description,
  issuetype={'name': 'Task'},
  labels=labels,
  priority={'name': priority}
)

return {
  'issue_id': issue.key,  # e.g., "PROJ-123"
  'url': f'{server}/browse/{issue.key}'
}
```

### Assign Issue

**API Call**:
```python
issue = jira.issue(issue_id)
jira.assign_issue(issue, assignee_username)
```

### Plan Sprint

**API Workflow**:
```python
# 1. Get active sprint
sprints = jira.sprints(board_id)
active_sprint = [s for s in sprints if s.state == 'active'][0]

# 2. Get backlog issues
backlog = jira.search_issues('project=PROJ AND status=Backlog')

# 3. Add issues to sprint
jira.add_issues_to_sprint(active_sprint.id, [issue.key for issue in selected])
```

## Authentication

Configure in .faber/config.yml:
```yaml
mcp_servers:
  jira_api:
    server: https://your-domain.atlassian.net
    email: ${JIRA_EMAIL}
    api_token: ${JIRA_API_TOKEN}
```
```

### Platform-Specific Configuration

Platforms can have additional configuration in overlays:

**Overlay**: `.faber/overlays/platforms/linear/contexts/company-linear-config.md`

```markdown
# Acme Corp Linear Configuration

**Extends**: Base platform-linear.md

## Workspace Details
- Workspace ID: `acme-engineering`
- Default Team: `team_backend` (Backend Team)

## Custom Labels
- `needs-triage`
- `customer-reported`
- `security`

## Priority Standards (Acme)
- P0 (Urgent): System down, < 4h SLA
- P1 (High): Major feature broken, < 24h SLA
- P2 (Medium): Enhancement, < 1w SLA
- P3 (Low): Nice-to-have, no SLA
```

## Platform Registry

### Supported Platforms (with MCP)

| Platform | MCP Server | Category | Status |
|----------|------------|----------|--------|
| GitHub | @modelcontextprotocol/server-github | SCM | Available |
| Linear | mcp-server-linear | Issues | Available |
| GitLab | mcp-server-gitlab | SCM | Community |
| Slack | @modelcontextprotocol/server-slack | Communication | Available |

### Platforms Needing MCP

| Platform | Category | Fallback | Priority |
|----------|----------|----------|----------|
| Jira | Issues | REST API | High |
| Azure DevOps | SCM/Issues | REST API | Medium |
| Bitbucket | SCM | REST API | Medium |
| Jenkins | CI/CD | REST API | Medium |

## Implementation Notes

### Platform Resolver

```typescript
class PlatformResolver {
  async resolvePlatform(role: Role, config: Config): Promise<Platform> {
    // 1. Get configured platform for role
    const platformName = config.platforms[role.name] || role.metadata.default_platform;

    if (!platformName) {
      throw new Error(`No platform configured for role: ${role.name}`);
    }

    // 2. Load platform context
    const context = await this.loadPlatformContext(role, platformName);

    // 3. Parse MCP server reference
    const mcpServer = context.metadata?.mcp_server;

    // 4. Load MCP server config (if exists)
    const mcpConfig = mcpServer ? config.mcp_servers[mcpServer] : null;

    return {
      name: platformName,
      context,
      mcpServer: mcpConfig,
      fallback: context.metadata?.fallback
    };
  }
}
```

### MCP Tool Wrapper

```typescript
class MCPToolExecutor {
  async execute(tool: string, params: object, platform: Platform): Promise<any> {
    if (platform.mcpServer) {
      // Use MCP server
      return this.executeMCP(tool, params, platform.mcpServer);
    } else if (platform.fallback === 'api') {
      // Use direct API (guidance in platform context)
      return this.executeAPI(tool, params, platform.context);
    } else {
      throw new Error(`No implementation for tool: ${tool} on platform: ${platform.name}`);
    }
  }
}
```

## Validation Rules

1. **Platform declaration**: If role declares platforms, must have matching platform-{name}.md
2. **MCP server reference**: If context references MCP server, server must exist in tools/ or be external
3. **Required tools**: Tools listed in required_tools should be documented in context
4. **Fallback specified**: If no MCP server, fallback must be specified

## Open Questions

1. Should platform contexts support versioning (platform API version changes)?
2. Should there be a platform compatibility matrix (which roles work with which platforms)?
3. Should platform switching be runtime-dynamic (not just build-time)?
4. Should there be a platform simulation mode for testing?

## References

- [SPEC-0004: Context System](./SPEC-0004-context-system.md)
- [SPEC-0008: Configuration System](./SPEC-0008-configuration-system.md)
- [SPEC-0012: MCP Server Integration](./SPEC-0012-mcp-server-integration.md)
- Model Context Protocol: https://modelcontextprotocol.io
