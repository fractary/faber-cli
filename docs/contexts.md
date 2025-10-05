# Context System Guide

The context system is the core innovation that makes Faber agents intelligent and adaptable. This guide explains how to create, organize, and use contexts effectively.

## Overview

Contexts are markdown files containing specialized knowledge that agents load dynamically based on the task at hand. Instead of cramming all knowledge into a monolithic prompt, contexts allow:

- **Lazy Loading** - Load only what's needed
- **Specialization** - Different expertise for different tasks
- **Reusability** - Share contexts across agents
- **Maintainability** - Update knowledge in one place

## The Seven Categories

### 1. Specialists (`specialists/`)

**Purpose**: Domain-specific expertise loaded on-demand.

**File Pattern**: `specialist-{domain}.md`

**Example**: `specialist-security.md`
```markdown
---
category: specialist
name: security
description: Security review and audit expertise
related: [standards-security.md, playbook-security-review.md]
---

# Security Specialist

You are adopting security expertise for this task.

## Security Principles
- Defense in depth
- Least privilege
- Zero trust architecture

## Review Checklist
- [ ] Input validation
- [ ] Authentication checks
- [ ] Authorization verification
- [ ] Data encryption
- [ ] Audit logging

## Common Vulnerabilities
- SQL Injection: Use parameterized queries
- XSS: Encode output, validate input
- CSRF: Use tokens
```

### 2. Platforms (`platforms/`)

**Purpose**: Platform-specific adapters, ideally wrapping MCP servers.

**File Pattern**: `platform-{name}.md`

**Example**: `platform-linear.md`
```markdown
---
category: platform
platform: linear
mcp_server: mcp-server-linear
required_tools: [linear_create_issue, linear_update_issue]
fallback: api
---

# Linear Platform Context

**MCP Server**: `mcp-server-linear`

## Available Tools
- `linear_create_issue` - Create issues
- `linear_update_issue` - Update issues
- `linear_list_issues` - Query issues

## Platform Concepts
- **Cycle**: Sprint/iteration (2-week default)
- **Team**: Development squad
- **Priority**: 0=None, 1=Urgent, 2=High, 3=Medium, 4=Low

## Task Mappings

### Create Issue (from /tasks/create-issue.md)
```javascript
const result = await mcp.call('linear_create_issue', {
  teamId: config.linear.teamId,
  title: input.title,
  description: input.description,
  priority: priorityMap[input.priority]
});
```
```

### 3. Standards (`standards/`)

**Purpose**: Best practices and conventions, often loaded by default.

**File Pattern**: `standards-{topic}.md`

**Example**: `standards-code-review.md`
```markdown
---
category: standard
name: code-review
description: Code review standards and checklist
---

# Code Review Standards

## Review Checklist

### Functionality
- [ ] Code accomplishes intended goal
- [ ] Edge cases handled
- [ ] Error handling appropriate

### Quality
- [ ] Clear naming
- [ ] DRY principle followed
- [ ] SOLID principles applied

### Testing
- [ ] Unit tests included
- [ ] Integration tests if needed
- [ ] Test coverage adequate (>80%)

### Documentation
- [ ] Functions documented
- [ ] Complex logic explained
- [ ] README updated if needed
```

### 4. Patterns (`patterns/`)

**Purpose**: Design patterns and architectural guidance.

**File Pattern**: `patterns-{pattern}.md`

**Example**: `patterns-event-driven.md`
```markdown
---
category: pattern
name: event-driven
description: Event-driven architecture patterns
---

# Event-Driven Architecture Patterns

## Pub/Sub Pattern
- Publishers emit events
- Subscribers react to events
- Decoupled communication

## Event Sourcing
- Store events, not state
- Rebuild state from events
- Complete audit trail

## Implementation
```javascript
class EventBus {
  publish(event) { /* ... */ }
  subscribe(type, handler) { /* ... */ }
}
```
```

### 5. Playbooks (`playbooks/`)

**Purpose**: Step-by-step operational procedures.

**File Pattern**: `playbook-{procedure}.md`

**Example**: `playbook-incident-response.md`
```markdown
---
category: playbook
name: incident-response
description: Incident response procedure
---

# Incident Response Playbook

## Severity Levels
- SEV1: Service down, customer impact
- SEV2: Degraded service
- SEV3: Minor issue
- SEV4: No immediate impact

## Response Steps

### 1. Assess (5 min)
- Determine severity
- Identify affected services
- Estimate customer impact

### 2. Communicate (10 min)
- Create incident channel
- Notify stakeholders
- Post status update

### 3. Mitigate (ongoing)
- Apply temporary fix
- Roll back if needed
- Monitor metrics

### 4. Resolve
- Implement permanent fix
- Verify resolution
- Close incident

### 5. Review
- Write postmortem
- Identify improvements
- Update runbooks
```

### 6. References (`references/`)

**Purpose**: API documentation and technical references.

**File Pattern**: `reference-{system}.md`

**Example**: `reference-github-api.md`
```markdown
---
category: reference
name: github-api
description: GitHub API reference
---

# GitHub API Reference

## Authentication
```bash
curl -H "Authorization: token $GITHUB_TOKEN"
```

## Issues API

### Create Issue
```javascript
POST /repos/{owner}/{repo}/issues
{
  "title": "Bug report",
  "body": "Description",
  "labels": ["bug"],
  "assignees": ["username"]
}
```

### Update Issue
```javascript
PATCH /repos/{owner}/{repo}/issues/{issue_number}
{
  "state": "closed",
  "labels": ["fixed"]
}
```
```

### 7. Troubleshooting (`troubleshooting/`)

**Purpose**: Error resolution and debugging guides.

**File Pattern**: `troubleshooting-{issue}.md`

**Example**: `troubleshooting-auth.md`
```markdown
---
category: troubleshooting
name: auth
description: Authentication troubleshooting
---

# Authentication Troubleshooting

## Common Issues

### Invalid Token
**Symptoms**: 401 Unauthorized
**Causes**:
- Token expired
- Token revoked
- Wrong scope

**Solutions**:
1. Regenerate token
2. Check token permissions
3. Verify environment variable

### Rate Limiting
**Symptoms**: 429 Too Many Requests
**Solutions**:
1. Add retry logic
2. Use conditional requests
3. Authenticate requests (higher limit)
```

## Context Loading Strategies

### 1. Platform-First Loading

Always load platform context based on configuration:

```markdown
# In prompt.md
## Platform Detection
1. Check `.faber/config.yml` for `platforms.{role-name}`
2. Load `/contexts/platforms/platform-{name}.md`
```

### 2. Keyword-Based Specialist Loading

Load specialists based on request analysis:

```markdown
# In prompt.md
## Specialist Loading
Keywords → Context mapping:
- "security", "vulnerability" → specialist-security.md
- "performance", "optimization" → specialist-performance.md
- "docker", "container" → specialist-containers.md
```

### 3. Default Standards Loading

Some standards should always be loaded:

```markdown
# In prompt.md
## Always Load
- /contexts/standards/standards-company-policy.md
- /contexts/standards/standards-code-style.md
```

### 4. Error-Driven Troubleshooting

Load troubleshooting contexts when errors occur:

```markdown
# In prompt.md
## Error Handling
On AuthenticationError → Load troubleshooting-auth.md
On RateLimitError → Load troubleshooting-rate-limits.md
```

## Context Frontmatter

Contexts can include optional YAML frontmatter:

```yaml
---
category: specialist          # Context category
name: security                # Unique name
description: Security expertise  # Brief description
platform: github              # Associated platform (platforms only)
mcp_server: mcp-server-github # MCP server (platforms only)
required_tools:               # Required MCP tools
  - github_create_issue
  - github_update_issue
fallback: api                 # Fallback method if no MCP
related:                      # Related contexts
  - standards-security.md
  - playbook-security-review.md
tags:                         # Searchable tags
  - security
  - audit
  - compliance
---
```

## Writing Effective Contexts

### Best Practices

1. **Keep Focused**: One topic per context
2. **Use Examples**: Show, don't just tell
3. **Be Actionable**: Provide clear steps
4. **Include References**: Link to sources
5. **Version if Needed**: Track changes

### Structure Template

```markdown
---
category: {category}
name: {name}
description: {description}
---

# {Title}

## Overview
Brief introduction to the topic.

## Key Concepts
- Concept 1: Explanation
- Concept 2: Explanation

## Practical Application
How to apply this knowledge.

## Examples
```code
Concrete examples
```

## Common Patterns
Frequently used approaches.

## Anti-patterns
What to avoid and why.

## References
- [External docs](url)
- Related contexts
```

## Context Composition

### Loading Order Matters

Contexts load in precedence order:
1. Platform context (base functionality)
2. Organization standards (company rules)
3. Platform overlays (instance config)
4. Role standards (role-specific)
5. Specialists (task-specific)

### Handling Conflicts

When contexts conflict, use merge strategies:

**Override**: Later context replaces earlier
```markdown
Base: "Require 1 approval"
Overlay: "Require 2 approvals" → Use overlay
```

**Merge**: Combine information
```markdown
Base: "Labels: bug, feature"
Overlay: "Labels: security, performance" → All labels
```

**Append**: Add requirements
```markdown
Base: "Test before deploy"
Overlay: "Also scan for vulnerabilities" → Both required
```

## Dynamic Context Loading

### In Prompt.md

```markdown
# Agent Prompt

## Context Loading Logic

### Always Load
- Platform context based on config
- Organization standards from overlays
- Base standards

### Conditionally Load
Based on task analysis:
- If security-related → specialist-security.md
- If performance issue → specialist-performance.md
- If deployment → playbook-deployment.md

### On Error Load
- On specific error types → troubleshooting-{error}.md
```

### Runtime Loading

Contexts can reference other contexts:

```markdown
# In specialist-security.md
For detailed standards, see:
- `/contexts/standards/standards-security.md`
- `/contexts/playbooks/playbook-security-review.md`
```

## Platform Context Deep Dive

Platform contexts are special - they bridge generic tasks to platform-specific implementations.

### Structure

```markdown
---
category: platform
platform: {name}
mcp_server: {mcp-server-name}
required_tools: [list]
---

# {Platform} Platform Context

## MCP Server
Details about MCP server usage.

## Platform Concepts
Map universal concepts to platform terms.

## Task Mappings
How each generic task maps to platform operations.

## Limitations
Platform-specific constraints.

## Workarounds
How to handle limitations.
```

### MCP Integration

Platform contexts should:
1. Reference MCP server
2. List required tools
3. Show tool usage examples
4. Handle fallbacks

## Testing Contexts

### Validation Checklist

- [ ] Context file exists where referenced
- [ ] Frontmatter is valid YAML
- [ ] Category matches directory
- [ ] Platform contexts have MCP info
- [ ] Examples are correct
- [ ] References are valid

### Context Coverage

Ensure coverage for:
- All declared platforms
- Common error scenarios
- Critical business processes
- Security requirements

## Next Steps

- [Overlay System](overlays.md) - Customize contexts
- [Examples](examples.md) - Real context examples
- [API Reference](api.md) - Programmatic context loading