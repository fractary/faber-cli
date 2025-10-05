---
spec: SPEC-0007
title: Overlay System - Customization Without Forking
status: draft
created: 2025-01-19
updated: 2025-01-19
authors: [Fractary Team]
implementation_status: complete
implementation_notes: |
  Fully implemented. Cascading overlay resolution, configuration merging,
  context collection, conflict detection, and all overlay types (organization,
  platform, role, team, workflow) working.
---

# Overlay System - Customization Without Forking

## Overview

The overlay system enables organizations to customize distributed role definitions without modifying source code. Overlays inject company-specific standards, product documentation, platform configurations, and other customizations while preserving the ability to update base definitions without merge conflicts.

## Motivation

### The Forking Problem

Organizations need to customize agents with:
- Company coding standards and security policies
- Internal API documentation and product docs
- Platform-specific configurations (workspace IDs, team names)
- Environment-specific settings (dev/staging/prod)

Traditional approach: **Fork the agent and modify source**

**Problems**:
1. **Merge conflicts**: Upstream updates require manual merging
2. **Divergence**: Customizations become incompatible with updates
3. **Duplication**: Same customizations repeated across agents
4. **Maintenance burden**: Must track and update forks

### Overlay Solution

**Overlays provide customization without source modification**:
- Inject contexts alongside base contexts
- Override configurations via precedence rules
- Merge company-specific knowledge
- Update base definitions independently

## Design

### Overlay Directory Structure

```
.faber/
  config.yml                    # Base configuration

  overlays/                     # Overlay root
    organization/               # Organization-level (applies to ALL)
      contexts/
        standards/
          company-coding-standards.md
          company-security-policy.md
        references/
          company-api-catalog.md
          company-product-docs.md
        playbooks/
          company-incident-response.md

    platforms/                  # Platform-specific
      {platform-name}/
        contexts/
          company-{platform}-config.md

    roles/                      # Role-specific
      {role-name}/
        contexts/
          standards/
          specialists/
          platforms/
        config.yml              # Role config overlay

    teams/                      # Team-specific
      {team-name}/
        contexts/
        config.yml

    workflows/                  # Workflow-specific
      {workflow-name}/
        contexts/
        config.yml
```

### Overlay Resolution Priority (Cascading)

Context loading order (later overrides earlier):

```
1. Base Concept Contexts           (roles/{role}/contexts/)
2. Organization Overlays            (.faber/overlays/organization/contexts/)
3. Platform Overlays                (.faber/overlays/platforms/{platform}/contexts/)
4. Concept-Specific Overlays        (.faber/overlays/roles/{role}/contexts/)
5. Team Overlays                    (.faber/overlays/teams/{team}/contexts/)
6. Custom Context Injection         (from config.yml -> custom_contexts[])
```

### Overlay Categories

Overlays mirror base context categories:

- `standards/` - Company-specific standards
- `specialists/` - Modifications to specialist contexts
- `platforms/` - Company-specific platform configs
- `references/` - Company product/API docs
- `playbooks/` - Company operational procedures
- `patterns/` - Company architecture patterns
- `troubleshooting/` - Company-specific issue resolution

### Configuration Overlays

**File**: `.faber/overlays/roles/{role}/config.yml`

```yaml
# Platform-specific settings
platform_config:
  linear:
    workspace: acme-engineering
    default_team: backend-team
    default_labels:
      - needs-triage
      - backend

# Custom contexts to always load
custom_contexts:
  - /.faber/overlays/organization/contexts/standards/company-coding-standards.md
  - /.faber/overlays/roles/issue-manager/contexts/acme-triage-rules.md

# Specialist customizations
specialist_config:
  sprint-planning:
    sprint_length_weeks: 2
    estimation_scale: fibonacci

# MCP tool preferences
mcp_config:
  timeout_ms: 30000
```

### Context Merging Strategies

#### Override Strategy

**Use Case**: Overlay completely replaces base information.

**Indicator**: Conflicting statements.

**Example**:
- **Base**: "PR requires 1 approval"
- **Overlay**: "PR requires 2 approvals from senior engineers"
- **Result**: Use overlay (2 approvals from seniors)

#### Merge Strategy

**Use Case**: Overlay adds to base.

**Indicator**: Complementary information.

**Example**:
- **Base**: "Supported labels: bug, feature"
- **Overlay**: "Additional labels: customer-reported, security"
- **Result**: bug, feature, customer-reported, security

#### Append Strategy

**Use Case**: Overlay adds requirements.

**Indicator**: Checklist or step-by-step.

**Example**:
- **Base**: "Before deploying: run tests"
- **Overlay**: "Before deploying: run tests, security scan, performance test"
- **Result**: All requirements (tests + security scan + performance test)

## Examples

### Example 1: Organization-Level Standard

**.faber/overlays/organization/contexts/standards/company-coding-standards.md**

```markdown
# Acme Corp Coding Standards

**Applied to**: All roles across all teams

## Code Review Requirements

All pull requests must:
1. Pass automated tests (coverage > 80%)
2. Have at least 2 approvals from senior team members
3. Include Linear ticket reference in title (format: ENG-123)
4. Follow conventional commits specification
5. Pass security scan (Snyk + SonarQube)

## Security Requirements

- No secrets in code (use AWS Secrets Manager)
- All API endpoints require JWT authentication
- Data encryption at rest for PII (AES-256)
- Dependencies scanned weekly

## Architecture Standards

- Microservices architecture
- Event-driven communication (SNS/SQS)
- API versioning (v1, v2, etc.)
- OpenAPI specs for all REST APIs

## When Creating PRs

Reference these standards in PR descriptions.
Agents should validate PRs against these requirements.
```

### Example 2: Platform Overlay

**.faber/overlays/platforms/linear/contexts/company-linear-workspace.md**

```markdown
# Acme Corp Linear Workspace Configuration

**Extends**: Base platform-linear.md

## Workspace Details
- Workspace: `acme-engineering`
- Teams:
  - Backend Team (team_abc123)
  - Frontend Team (team_def456)
  - Mobile Team (team_ghi789)

## Custom Labels
- `needs-triage` - New issues requiring review
- `customer-reported` - From customer support
- `security` - Security-related issues
- `tech-debt` - Technical debt items

## Priority Standards (Acme)
- P0 (Urgent): System down, customer-impacting, < 4h SLA
- P1 (High): Major feature broken, < 24h SLA
- P2 (Medium): Enhancement, < 1w SLA
- P3 (Low): Nice-to-have, no SLA

## Cycle Configuration
- Duration: 2 weeks (Monday-Friday)
- Sprint Planning: Mondays 10am PST
- Retrospective: Fridays 3pm PST

## Workflows

### Creating Backend Issue
```
1. Set teamId: team_abc123 (Backend Team)
2. Add label: "needs-triage"
3. If P0/P1: Add to current cycle immediately
4. If security: Add "security" label, notify @security-team
```

### Jira Sync
Issues with "customer-reported" label automatically sync to Jira.
```

### Example 3: Role Overlay

**.faber/overlays/roles/issue-manager/contexts/standards/company-issue-templates.md**

```markdown
# Acme Corp Issue Templates

## Bug Report Template
```
**Summary**: [One-line description]

**Environment**:
- Service: [payment-service | user-service | ...]
- Version: [from deployment]
- Environment: [prod | staging | dev]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]

**Expected vs Actual**:
- Expected: [what should happen]
- Actual: [what happens]

**Impact**:
- Users affected: [number/%]
- Revenue impact: [if applicable]
- Severity: [P0 | P1 | P2 | P3]

**Related Issues**: [Linear/Jira links]
```

## Feature Request Template
[Similar structure...]

## When Creating Issues

Use appropriate template based on type.
All required fields must be filled.
```

### Example 4: Role Configuration Overlay

**.faber/overlays/roles/issue-manager/config.yml**

```yaml
platform_config:
  linear:
    workspace: acme-engineering
    default_team: backend-team
    default_labels:
      - needs-triage

custom_contexts:
  - /.faber/overlays/organization/contexts/standards/company-coding-standards.md
  - /.faber/overlays/organization/contexts/references/company-service-catalog.md
  - /.faber/overlays/roles/issue-manager/contexts/standards/company-issue-templates.md

specialist_config:
  sprint-planning:
    sprint_length_weeks: 2
    velocity_tracking: true
    estimation_scale: fibonacci
```

## Context Loading with Overlays

**In prompt.md**, roles specify overlay loading:

```markdown
# Issue Manager Agent

## Context Loading Sequence

### 1. Platform Context (Base + Overlay)
- Base: `/contexts/platforms/platform-{configured}.md`
- Overlay: `/.faber/overlays/platforms/{configured}/contexts/*.md`

### 2. Organization Standards (Overlay Only)
- Load all: `/.faber/overlays/organization/contexts/standards/*.md`
- Load all: `/.faber/overlays/organization/contexts/references/*.md`

### 3. Base Standards
- Load all: `/contexts/standards/*.md`

### 4. Role Overlays
- Load all: `/.faber/overlays/roles/issue-manager/contexts/standards/*.md`
- Load all: `/.faber/overlays/roles/issue-manager/contexts/specialists/*.md`

### 5. Custom Contexts (From Config)
- Read: `/.faber/overlays/roles/issue-manager/config.yml -> custom_contexts[]`
- Load each specified context

## Overlay Precedence

When base and overlay conflict:
- **Override**: Overlay replaces base
- **Merge**: Overlay adds to base
- **Append**: Overlay extends base requirements
```

## Build Process with Overlays

```
1. Load Base Definition
   - Load role metadata (agent.yml)
   - Load base contexts

2. Discover Overlays
   - Scan .faber/overlays/organization/
   - Scan .faber/overlays/platforms/{configured}/
   - Scan .faber/overlays/roles/{role}/
   - Scan .faber/overlays/teams/{team}/ (if building team)

3. Merge Configurations
   - Load base config
   - Apply organization config overlays
   - Apply platform config overlays
   - Apply role config overlays
   - Resolve final configuration (precedence)

4. Collect Contexts
   - Base contexts
   - Organization overlay contexts
   - Platform overlay contexts
   - Role overlay contexts
   - Custom injected contexts (from config)

5. Transform and Deploy
   - Apply binding transformation
   - Include all contexts (base + overlays)
   - Preserve overlay provenance
```

## Deployment Structure with Overlays

```
deployments/claude/
  .claude/
    agents/fractary/devops/
      issue-manager.md           # Includes overlay loading logic

  .faber/
    config.yml                   # Merged configuration

  docs/agents/fractary/devops/issue-manager/
    contexts/
      # Base contexts
      specialists/
      platforms/
      standards/

      # Overlays (clearly separated)
      _overlays/
        organization/
          standards/
            company-coding-standards.md
          references/
            company-api-catalog.md

        platform/
          linear/
            company-linear-workspace.md

        role/
          issue-manager/
            standards/
              company-issue-templates.md
```

## CLI Commands

### Overlay Initialization
```bash
faber overlay init
```
Creates `.faber/overlays/` structure with templates.

### Overlay Creation
```bash
faber overlay create organization
faber overlay create role issue-manager
faber overlay create platform linear
faber overlay create team release-team
```

### Overlay Listing
```bash
faber overlay list                    # All overlays
faber overlay list organization       # Org overlays
faber overlay list role issue-manager # Role overlays
```

### Overlay Status
```bash
faber overlay status                  # All overlay status
faber overlay status role issue-manager
```

Shows:
- Active overlays
- Resolution chain
- Context merge summary
- Configuration overrides

### Overlay Diff
```bash
faber overlay diff role issue-manager
```

Shows:
- Base vs overlay differences
- Overridden contexts
- Configuration changes
- Added contexts

### Build with Overlays
```bash
faber build claude --with-overlays                    # Default
faber build claude role issue-manager --with-overlays # Explicit
```

## Implementation Notes

### Overlay Resolver

```typescript
class OverlayResolver {
  async resolve(concept: Concept, config: Config): Promise<Overlays> {
    const overlays: Overlays = {
      organization: await this.loadOrganizationOverlays(),
      platforms: {},
      roles: {},
      teams: {}
    };

    // Platform overlays (if platform configured)
    const platform = config.platforms[concept.name];
    if (platform) {
      overlays.platforms[platform] = await this.loadPlatformOverlays(platform);
    }

    // Concept-specific overlays
    if (concept.type === 'role') {
      overlays.roles[concept.name] = await this.loadRoleOverlays(concept.name);
    } else if (concept.type === 'team') {
      overlays.teams[concept.name] = await this.loadTeamOverlays(concept.name);
    }

    return overlays;
  }
}
```

### Context Merger

```typescript
class ContextMerger {
  merge(base: Context[], overlays: Context[]): Context[] {
    const merged: Context[] = [];

    // Add all base contexts
    for (const baseCtx of base) {
      const overlay = this.findOverlay(baseCtx, overlays);

      if (overlay) {
        // Merge base + overlay
        merged.push(this.mergeContext(baseCtx, overlay));
      } else {
        // No overlay, use base as-is
        merged.push(baseCtx);
      }
    }

    // Add overlay-only contexts
    for (const overlayCtx of overlays) {
      if (!this.hasBase(overlayCtx, base)) {
        merged.push(overlayCtx);
      }
    }

    return merged;
  }

  private mergeContext(base: Context, overlay: Context): Context {
    // Determine merge strategy (override/merge/append)
    const strategy = this.determineMergeStrategy(base, overlay);

    switch (strategy) {
      case 'override':
        return overlay;  // Overlay completely replaces base
      case 'merge':
        return { ...base, content: base.content + '\n\n' + overlay.content };
      case 'append':
        return { ...base, content: this.appendContent(base.content, overlay.content) };
    }
  }
}
```

### Config Merger

```typescript
class ConfigMerger {
  merge(base: Config, ...overlays: Partial<Config>[]): Config {
    let merged = { ...base };

    for (const overlay of overlays) {
      merged = this.deepMerge(merged, overlay);
    }

    return merged;
  }

  private deepMerge(target: any, source: any): any {
    // Deep merge with overlay precedence
    for (const key in source) {
      if (source[key] instanceof Object && key in target) {
        target[key] = this.deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }
}
```

## Validation Rules

1. **Overlay structure valid**: Must follow .faber/overlays/ structure
2. **Context references valid**: Overlay contexts must be valid markdown
3. **Config schema valid**: Overlay configs must match schema
4. **No circular refs**: Overlays can't circularly reference
5. **Paths resolve**: Custom context paths must exist

## Benefits

1. **No Forking Required**: Customize without modifying source
2. **Upgrade-Safe**: Update base roles, keep overlays intact
3. **Company Standards**: Inject organization-wide policies
4. **Multi-Environment**: Different overlays per environment (dev/staging/prod)
5. **Incremental Adoption**: Start with base, add overlays as needed
6. **Separation of Concerns**: Base = generic, overlay = company-specific
7. **Reusable**: Same overlay applied to multiple roles

## Open Questions

1. Should overlays support versioning?
2. Should there be an overlay marketplace?
3. Should overlays support conditionals (load based on environment)?
4. Should there be overlay validation warnings (e.g., "overlay references deprecated base context")?

## References

- [SPEC-0003: Role Structure](./SPEC-0003-role-structure.md)
- [SPEC-0004: Context System](./SPEC-0004-context-system.md)
- [SPEC-0008: Configuration System](./SPEC-0008-configuration-system.md)
- [SPEC-0010: Build and Deployment](./SPEC-0010-build-deployment-process.md)
