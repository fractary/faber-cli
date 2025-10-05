---
spec: SPEC-0004
title: Context System - Dynamic Knowledge Loading
status: draft
created: 2025-01-19
updated: 2025-01-19
authors: [Fractary Team]
---

# Context System - Dynamic Knowledge Loading

## Overview

The context system is a core innovation of Faber-CLI, enabling roles to dynamically load specialized knowledge as needed rather than loading everything upfront. Contexts are categorized by purpose and loaded based on task requirements, platform configuration, and overlays.

## Motivation

### Problems with Monolithic Prompts

Traditional agent approaches embed all knowledge in a single large prompt:
- **Token waste**: Loading irrelevant information
- **Maintenance burden**: Single file becomes unmaintainable
- **Poor reusability**: Can't share contexts across agents
- **No specialization**: Agent has same knowledge for all tasks

### Context System Benefits

1. **Lazy Loading**: Load only relevant knowledge for current task
2. **Specialization**: Agent adopts different expertise on-demand
3. **Composability**: Mix contexts (specialist + platform + standards)
4. **Reusability**: Same context used by multiple roles
5. **Maintainability**: Update expertise in one place
6. **Framework Agnostic**: Contexts stay identical across all frameworks

## Design

### Context Categories

Contexts are organized into seven categories, each serving a distinct purpose:

#### 1. specialists/

**Purpose**: Expertise and specialty contexts loaded on-demand based on task.

**When to Load**: User request requires specific expertise.

**Examples**:
- `specialist-microservices.md` - Microservices architecture expertise
- `specialist-security.md` - Security review and audit expertise
- `specialist-performance.md` - Performance optimization expertise
- `specialist-sprint-planning.md` - Sprint planning methodology

**Pattern**: Single agent, multiple specializations.

#### 2. platforms/

**Purpose**: Platform-specific contexts that adapt generic tasks to specific platforms. Ideally wrap MCP servers.

**When to Load**: Based on configured platform (from .faber/config.yml).

**Examples**:
- `platform-github.md` - GitHub-specific operations and MCP tools
- `platform-linear.md` - Linear-specific operations and MCP tools
- `platform-jira.md` - Jira-specific operations (API or MCP)

**Pattern**: Config-driven platform detection → load platform context → use MCP tools.

#### 3. standards/

**Purpose**: Best practices, coding standards, and conventions. Often loaded by default.

**When to Load**: Always or when performing related operations.

**Examples**:
- `standards-api-design.md` - API design principles
- `standards-commit-messages.md` - Commit message conventions
- `standards-code-review.md` - Code review checklist

**Pattern**: Shared across all operations to ensure consistency.

#### 4. patterns/

**Purpose**: Design patterns, architectural patterns, and solution templates. Reference material.

**When to Load**: When implementing or discussing specific patterns.

**Examples**:
- `patterns-microservices.md` - Microservices patterns catalog
- `patterns-event-driven.md` - Event-driven architecture patterns
- `patterns-caching.md` - Caching strategies

**Pattern**: Reference library for design decisions.

#### 5. playbooks/

**Purpose**: Step-by-step operational procedures and runbooks.

**When to Load**: When executing specific workflows or handling incidents.

**Examples**:
- `playbook-incident-response.md` - Incident handling procedure
- `playbook-deployment.md` - Deployment checklist
- `playbook-security-review.md` - Security review process

**Pattern**: Procedural guidance for operational tasks.

#### 6. references/

**Purpose**: API documentation, framework references, external docs.

**When to Load**: As needed for API calls or framework usage.

**Examples**:
- `reference-github-api.md` - GitHub API reference
- `reference-linear-api.md` - Linear API reference
- `reference-kubernetes.md` - Kubernetes resource reference

**Pattern**: On-demand documentation lookup.

#### 7. troubleshooting/

**Purpose**: Common issues, error resolution, debugging guides.

**When to Load**: When errors occur or user reports issues.

**Examples**:
- `troubleshooting-auth.md` - Authentication issues
- `troubleshooting-rate-limits.md` - Rate limiting problems
- `troubleshooting-permissions.md` - Permission errors

**Pattern**: Error-driven loading.

### Context File Structure

#### Context Frontmatter (Optional)

Contexts can include YAML frontmatter for metadata:

```markdown
---
category: specialist | platform | standard | pattern | playbook | reference | troubleshooting
name: sprint-planning
description: Sprint planning methodology and best practices
related:
  - standards-estimation.md
  - playbook-sprint-retrospective.md
tags: [agile, scrum, planning]
---

# Sprint Planning Specialist

[Context content...]
```

#### Platform Context Frontmatter (Special)

Platform contexts have additional metadata for MCP integration:

```markdown
---
category: platform
platform: linear
mcp_server: mcp-server-linear
required_tools:
  - linear_create_issue
  - linear_update_issue
  - linear_list_issues
fallback: api
---

# Linear Platform Context

**MCP Server**: Use `mcp-server-linear` for all Linear operations.

[Context content...]
```

### Context Loading Patterns

#### Pattern 1: Platform-Driven Loading

**Trigger**: Agent starts, detects platform from config.

**Flow**:
```
1. Check .faber/config.yml → platforms.{role-name}
2. Load contexts/platforms/platform-{detected}.md
3. Parse MCP server reference from context
4. Configure MCP tools for use
```

**Example**:
```markdown
# In prompt.md

## Platform Detection
1. Check config: `platforms.issue-manager`
2. If "linear" → Load `/contexts/platforms/platform-linear.md`
3. Platform context references `mcp-server-linear`
4. Use Linear MCP tools for all operations
```

#### Pattern 2: Task-Driven Specialist Loading

**Trigger**: User request indicates need for specific expertise.

**Flow**:
```
1. Analyze user request
2. Identify required specialist(s)
3. Load relevant specialist context(s)
4. Apply specialist knowledge to task
```

**Example**:
```markdown
# In prompt.md

## Specialist Loading
Based on request keywords:
- "sprint" | "iteration" | "planning" → Load `/contexts/specialists/specialist-sprint-planning.md`
- "security" | "vulnerability" | "audit" → Load `/contexts/specialists/specialist-security.md`
- "performance" | "optimization" | "latency" → Load `/contexts/specialists/specialist-performance.md`
```

#### Pattern 3: Composable Multi-Context Loading

**Trigger**: Complex request needs multiple contexts.

**Flow**:
```
1. Platform context (always)
2. Standard contexts (often)
3. Specialist context(s) (as needed)
4. Overlay contexts (if present)
```

**Example Request**: "Review security of monorepo and create Linear issue with fixes"

**Contexts Loaded**:
```
1. Platform: contexts/platforms/platform-linear.md
2. Specialist: contexts/specialists/specialist-security.md
3. Specialist: contexts/specialists/specialist-monorepo.md
4. Standard: contexts/standards/standards-code-review.md
5. Overlay (org): .faber/overlays/organization/contexts/standards/company-security-policy.md
```

#### Pattern 4: Error-Driven Troubleshooting

**Trigger**: Error occurs during operation.

**Flow**:
```
1. Error detected
2. Identify error type
3. Load relevant troubleshooting context
4. Apply resolution steps
```

**Example**:
```markdown
# In prompt.md

## Error Handling
On authentication error:
1. Load `/contexts/troubleshooting/troubleshooting-auth.md`
2. Follow resolution steps
3. Report to user if unresolvable
```

### Context Reference Syntax

Contexts reference each other and external resources using consistent syntax:

#### Absolute Paths (Preferred)

```markdown
Load platform context: `/contexts/platforms/platform-linear.md`
Load specialist: `/contexts/specialists/specialist-security.md`
Load overlay: `/.faber/overlays/organization/contexts/standards/company-policy.md`
```

#### Relative Paths (Within Category)

```markdown
See also: `./specialist-performance.md` (same category)
Related: `../standards/standards-api-design.md` (different category)
```

#### Cross-Role References (Future)

```markdown
Reference: `@role:repo-manager/contexts/platforms/platform-github.md`
```

### Context Composition and Precedence

When multiple contexts provide overlapping information:

#### Override Strategy

**Use Case**: Overlay completely replaces base.

**Example**:
- Base: "PR requires 1 approval"
- Overlay: "PR requires 2 approvals from senior engineers"
- **Result**: Use overlay (2 approvals from seniors)

#### Merge Strategy

**Use Case**: Overlay adds to base.

**Example**:
- Base: "Supported labels: bug, feature"
- Overlay: "Additional labels: customer-reported, security"
- **Result**: All labels available (bug, feature, customer-reported, security)

#### Append Strategy

**Use Case**: Overlay adds requirements.

**Example**:
- Base: "Before deploying: run tests"
- Overlay: "Before deploying: run tests, security scan, performance test"
- **Result**: All requirements (tests + security scan + performance test)

### Context Loading in prompt.md

**Template Pattern**:

```markdown
# {Role Name} Agent

## Context Loading Sequence

### 1. Platform Context (Base)
**CRITICAL - Load First**
- Check config: `.faber/config.yml -> platforms.{role-name}`
- Load: `/contexts/platforms/platform-{detected}.md`

### 2. Organization Standards (Overlay)
**Always load if present**
- Load all: `/.faber/overlays/organization/contexts/standards/*.md`
- Load all: `/.faber/overlays/organization/contexts/references/*.md`

### 3. Platform Overlay (If Exists)
**Load for detected platform**
- Load: `/.faber/overlays/platforms/{detected}/contexts/*.md`

### 4. Base Standards
**Load default standards**
- Load all: `/contexts/standards/*.md`

### 5. Role Standards Overlay (If Exists)
**Load role-specific overlays**
- Load all: `/.faber/overlays/roles/{role-name}/contexts/standards/*.md`

### 6. Specialists (On-Demand)
**Load based on user request**
- Keywords → Specialist mapping in table below

### 7. Custom Contexts (From Config)
**Load additional contexts**
- Read: `/.faber/overlays/roles/{role-name}/config.yml -> custom_contexts[]`
- Load each specified context

## Specialist Keyword Mapping

| Keywords | Specialist Context |
|----------|-------------------|
| sprint, iteration, planning | specialist-sprint-planning.md |
| security, vulnerability, audit | specialist-security.md |
| performance, optimization, latency | specialist-performance.md |
| monorepo, multi-package | specialist-monorepo.md |

## Troubleshooting Context Loading

On error, load relevant troubleshooting:

| Error Type | Troubleshooting Context |
|------------|------------------------|
| AuthenticationError | troubleshooting-auth.md |
| RateLimitError | troubleshooting-rate-limits.md |
| PermissionError | troubleshooting-permissions.md |
```

## Examples

### Example 1: Platform Context

**File**: `contexts/platforms/platform-linear.md`

```markdown
---
category: platform
platform: linear
mcp_server: mcp-server-linear
required_tools:
  - linear_create_issue
  - linear_update_issue
fallback: api
---

# Linear Platform Context

**MCP Server**: Use `mcp-server-linear` for all Linear operations.

## Available Tools (via MCP)

- `linear_create_issue` - Create new issue
- `linear_update_issue` - Update existing issue
- `linear_list_issues` - List issues with filters
- `linear_list_teams` - List workspace teams
- `linear_list_cycles` - List cycles/sprints

## Platform Concepts

- **Cycle**: Linear's term for sprint/iteration
- **Estimate**: Built-in story points (0.5, 1, 2, 3, 5, 8, 13, 21)
- **Priority**: 0=None, 1=Urgent, 2=High, 3=Medium, 4=Low

## Task Mappings

### Create Issue (from /tasks/create-issue.md)
```
MCP Tool: linear_create_issue
Parameters:
  - title: string (required)
  - description: string (required)
  - teamId: string (from config or prompt)
  - priority: number (0-4)
  - estimate: number (optional)
```

### Plan Sprint (from /tasks/plan-sprint.md)
```
1. List cycles: linear_list_cycles
2. List backlog: linear_list_issues(filter: {state: "Backlog"})
3. Assign to cycle: linear_update_issue(issueId, cycleId)
4. Estimate issues: linear_update_issue(issueId, estimate)
```
```

### Example 2: Specialist Context

**File**: `contexts/specialists/specialist-security.md`

```markdown
---
category: specialist
name: security
description: Security review and audit expertise
related:
  - standards-security-checklist.md
  - playbook-security-review.md
---

# Security Specialist

You are adopting security expertise for this task.

## Security Review Checklist

### Code Review
- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output encoding)
- [ ] CSRF protection (tokens)
- [ ] Authentication on protected endpoints
- [ ] Authorization checks (role-based access)

### Dependencies
- [ ] All dependencies up to date
- [ ] No known vulnerabilities (check Snyk/npm audit)
- [ ] License compatibility verified

### Infrastructure
- [ ] HTTPS enforced
- [ ] Secure headers (CSP, HSTS, X-Frame-Options)
- [ ] Rate limiting implemented
- [ ] Secrets in environment variables (not code)

### Data Protection
- [ ] PII encrypted at rest
- [ ] PII encrypted in transit
- [ ] Audit logging for sensitive operations
- [ ] Data retention policy followed

## Common Vulnerabilities

### SQL Injection
**Bad**:
```javascript
query = `SELECT * FROM users WHERE id = ${userId}`;
```

**Good**:
```javascript
query = db.prepare('SELECT * FROM users WHERE id = ?');
query.run(userId);
```

[More examples...]

## When Creating Security Issues

- **Priority**: High or Urgent (based on severity)
- **Labels**: "security", "vulnerability"
- **Description**: Include CVE if applicable, CVSS score, affected versions
- **Remediation**: Specific steps to fix
```

### Example 3: Standards Context

**File**: `contexts/standards/standards-commit-messages.md`

```markdown
---
category: standard
name: commit-messages
description: Commit message conventions
related:
  - standards-branching.md
---

# Commit Message Standards

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Type

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Code style (formatting, no logic change)
- **refactor**: Code restructuring (no feature change)
- **perf**: Performance improvement
- **test**: Adding/updating tests
- **chore**: Build, tooling, dependencies

## Examples

### Feature
```
feat(auth): add JWT token refresh

Implement automatic token refresh before expiration.
Tokens refresh 5 minutes before expiry.

Closes #123
```

### Bug Fix
```
fix(api): handle null response in user endpoint

Add null check before accessing user.email.
Prevents TypeError when user not found.

Fixes #456
```

## Rules

- Subject line ≤ 50 characters
- Body wraps at 72 characters
- Use imperative mood ("add" not "added")
- Reference issue/ticket in footer
```

## Implementation Notes

### Context Loader

```typescript
enum ContextCategory {
  SPECIALIST = 'specialists',
  PLATFORM = 'platforms',
  STANDARD = 'standards',
  PATTERN = 'patterns',
  PLAYBOOK = 'playbooks',
  REFERENCE = 'references',
  TROUBLESHOOTING = 'troubleshooting'
}

interface Context {
  category: ContextCategory;
  name: string;
  content: string;
  metadata?: ContextMetadata;
}

class ContextLoader {
  async load(role: Role, category: ContextCategory, name: string): Promise<Context> {
    const path = `${role.path}/contexts/${category}/${name}.md`;
    const content = await fs.readFile(path, 'utf-8');
    const metadata = this.parseFrontmatter(content);
    return { category, name, content, metadata };
  }

  async loadPlatformContext(role: Role, platform: string): Promise<Context> {
    return this.load(role, ContextCategory.PLATFORM, `platform-${platform}`);
  }

  async loadAllInCategory(role: Role, category: ContextCategory): Promise<Context[]> {
    const dir = `${role.path}/contexts/${category}/`;
    const files = await fs.readdir(dir);
    return Promise.all(
      files
        .filter(f => f.endsWith('.md'))
        .map(f => this.load(role, category, f.replace('.md', '')))
    );
  }
}
```

### Context Resolver

```typescript
class ContextResolver {
  resolve(role: Role, config: Config, overlays: Overlays): Context[] {
    const contexts: Context[] = [];

    // 1. Platform context
    const platform = config.platforms[role.name];
    if (platform) {
      contexts.push(this.loadPlatformContext(role, platform));
    }

    // 2. Organization overlays
    contexts.push(...overlays.organization.contexts);

    // 3. Platform overlays
    if (platform) {
      contexts.push(...overlays.platforms[platform]?.contexts || []);
    }

    // 4. Base standards
    contexts.push(...this.loadAllInCategory(role, ContextCategory.STANDARD));

    // 5. Role overlays
    contexts.push(...overlays.roles[role.name]?.contexts || []);

    // 6. Custom contexts (from config)
    const customPaths = overlays.roles[role.name]?.config?.custom_contexts || [];
    contexts.push(...this.loadCustomContexts(customPaths));

    return contexts;
  }
}
```

## Validation Rules

1. **Context files must exist**: All referenced contexts in prompt.md must exist
2. **Platform contexts required**: If role declares platforms, must have matching platform-{name}.md
3. **Valid frontmatter**: If frontmatter present, must be valid YAML
4. **MCP server references**: Platform contexts referencing MCP servers must have valid tool:mcp-server-{name}

## Open Questions

1. Should contexts support versioning?
2. Should contexts support includes/partials (one context loading another)?
3. Should there be a context marketplace/registry?
4. Should contexts support conditionals (load different content based on config)?

## References

- [SPEC-0003: Role Structure](./SPEC-0003-role-structure.md)
- [SPEC-0005: Platform Abstraction](./SPEC-0005-platform-abstraction.md)
- [SPEC-0007: Overlay System](./SPEC-0007-overlay-system.md)
- [SPEC-0012: MCP Server Integration](./SPEC-0012-mcp-server-integration.md)
