# Overlay System Guide

The overlay system enables organizations to customize Faber agents without forking or modifying the source. This guide explains how to create and use overlays effectively.

## Why Overlays?

### The Problem with Forking

Traditional customization requires forking agent code, leading to:
- **Maintenance burden** - Manual merging of upstream updates
- **Divergence** - Customizations become incompatible
- **Duplication** - Same changes across multiple agents

### The Overlay Solution

Overlays provide customization layers that:
- **Don't modify source** - Keep base agents pristine
- **Cascade cleanly** - Apply in precedence order
- **Stay portable** - Move between projects easily
- **Update safely** - No merge conflicts

## Overlay Types

### 1. Organization Overlays

**Purpose**: Company-wide standards and policies

**Location**: `.faber/overlays/organization/`

**Use Cases**:
- Company coding standards
- Security policies
- Compliance requirements
- Brand guidelines

### 2. Platform Overlays

**Purpose**: Platform-specific configurations

**Location**: `.faber/overlays/platforms/{platform}/`

**Use Cases**:
- Instance configurations (URLs, IDs)
- Custom workflows
- Platform limitations
- Integration settings

### 3. Role Overlays

**Purpose**: Role-specific customizations

**Location**: `.faber/overlays/roles/{role}/`

**Use Cases**:
- Role-specific standards
- Custom contexts
- Modified behaviors
- Additional tasks

### 4. Team Overlays

**Purpose**: Team composition adjustments

**Location**: `.faber/overlays/teams/{team}/`

**Use Cases**:
- Team structure changes
- Coordination rules
- Custom workflows

### 5. Workflow Overlays

**Purpose**: Workflow customizations

**Location**: `.faber/overlays/workflows/{workflow}/`

**Use Cases**:
- Stage modifications
- Trigger adjustments
- Team assignments

## Overlay Structure

```
.faber/overlays/
├── organization/
│   ├── contexts/
│   │   ├── standards/
│   │   │   ├── company-coding-standards.md
│   │   │   └── company-security-policy.md
│   │   ├── references/
│   │   │   └── company-api-docs.md
│   │   └── playbooks/
│   │       └── company-incident-response.md
│   └── config.yml
├── platforms/
│   ├── github/
│   │   ├── contexts/
│   │   │   └── github-enterprise-config.md
│   │   └── config.yml
│   └── linear/
│       ├── contexts/
│       │   └── linear-workspace.md
│       └── config.yml
└── roles/
    └── issue-manager/
        ├── contexts/
        │   └── standards/
        │       └── issue-templates.md
        └── config.yml
```

## Creating Overlays

### Organization Overlay Example

Create `.faber/overlays/organization/contexts/standards/company-policy.md`:

```markdown
# Acme Corp Development Standards

## Code Review Policy

All code must:
- Have 2+ approvals from senior engineers
- Pass automated security scanning
- Include unit tests (coverage > 80%)
- Follow our style guide

## Security Requirements

- No hardcoded secrets (use HashiCorp Vault)
- All APIs require authentication
- PII must be encrypted at rest
- Audit all data access

## Deployment Process

1. All deployments go through staging first
2. Production requires VP approval for database changes
3. Rollback plan required for all changes
4. Monitoring alerts must be configured
```

### Platform Overlay Example

Create `.faber/overlays/platforms/linear/contexts/workspace-config.md`:

```markdown
# Linear Workspace Configuration

## Workspace Details
- ID: `workspace_abc123`
- URL: `https://linear.app/acme`

## Teams
- Backend: `team_backend_xyz`
- Frontend: `team_frontend_uvw`
- Mobile: `team_mobile_rst`

## Custom Fields
- `customer_impact`: Required for all bugs
- `revenue_risk`: Required for P0/P1
- `compliance_review`: Required for data changes

## Automation Rules
- Auto-assign based on component labels
- Auto-close after 30 days inactive
- Escalate P0 to engineering manager
```

### Role Overlay Example

Create `.faber/overlays/roles/issue-manager/config.yml`:

```yaml
# Custom configuration for issue-manager role

platform_config:
  linear:
    default_team: team_backend_xyz
    default_labels:
      - needs-triage
      - backend
    priority_mapping:
      urgent: 1
      high: 2
      medium: 3
      low: 4

custom_contexts:
  - /.faber/overlays/organization/contexts/standards/company-policy.md
  - /.faber/overlays/organization/contexts/standards/issue-sla.md

specialist_config:
  triage:
    auto_assign: true
    sla_hours:
      urgent: 4
      high: 24
      medium: 72
      low: 168
```

## Overlay Resolution

### Cascading Order

Overlays apply in this order (later overrides earlier):

1. **Base Definition** - Original role/team/workflow
2. **Organization Overlay** - Company-wide
3. **Platform Overlay** - Platform-specific
4. **Concept Overlay** - Role/team/workflow-specific
5. **Runtime Config** - Environment variables

### Example Resolution

```
Base Role: issue-manager
  ↓
+ Organization: company-policy.md, security.md
  ↓
+ Platform (Linear): linear-workspace.md
  ↓
+ Role: custom-templates.md, sla-rules.md
  ↓
= Final Deployed Agent
```

## Configuration Merging

### Merge Strategies

#### Deep Merge (Objects)
```yaml
# Base
config:
  timeout: 30
  retry: 3

# Overlay
config:
  timeout: 60
  max_connections: 10

# Result
config:
  timeout: 60        # Overridden
  retry: 3          # Preserved
  max_connections: 10 # Added
```

#### Array Append
```yaml
# Base
labels: [bug, feature]

# Overlay
labels: [security, performance]

# Result
labels: [bug, feature, security, performance]
```

#### Override
```yaml
# Base
approval_required: 1

# Overlay
approval_required: 2

# Result
approval_required: 2
```

## Context Overlay Patterns

### Adding Company Standards

```markdown
# .faber/overlays/organization/contexts/standards/api-design.md

# Acme API Design Standards

## RESTful Principles
- Use proper HTTP verbs
- Resource-based URLs
- Consistent naming (camelCase)

## Versioning
- URL versioning (/v1, /v2)
- Deprecation notices (6 months)
- Backward compatibility

## Security
- OAuth 2.0 for authentication
- Rate limiting (1000 req/hour)
- API keys for service accounts
```

### Platform-Specific Workflows

```markdown
# .faber/overlays/platforms/github/contexts/workflows/pr-process.md

# GitHub PR Process (Acme)

## Branch Protection
- Require PR for main branch
- Dismiss stale reviews
- Require up-to-date branches

## Required Checks
- CI/CD pipeline passes
- Security scan clean
- Code coverage > 80%
- No merge conflicts

## Auto-merge Rules
- Dependabot PRs with passing tests
- Documentation-only changes
```

### Role Behavior Modifications

```markdown
# .faber/overlays/roles/security-scanner/contexts/specialists/custom-rules.md

# Custom Security Rules

## Additional Checks

### API Security
- Check for API versioning
- Verify rate limiting
- Audit authentication

### Data Protection
- Scan for PII exposure
- Check encryption at rest
- Verify data retention

### Compliance
- GDPR compliance check
- CCPA requirements
- SOC2 controls
```

## Advanced Overlay Techniques

### Environment-Specific Overlays

Create different overlays for environments:

```
.faber/overlays/
├── environments/
│   ├── development/
│   │   └── config.yml
│   ├── staging/
│   │   └── config.yml
│   └── production/
│       └── config.yml
```

### Multi-Tenant Overlays

Support multiple customers:

```
.faber/overlays/
├── tenants/
│   ├── customer-a/
│   │   └── contexts/
│   ├── customer-b/
│   │   └── contexts/
│   └── customer-c/
│       └── contexts/
```

### Conditional Loading

Load overlays based on conditions:

```yaml
# .faber/overlays/roles/issue-manager/config.yml
conditional_contexts:
  - condition: "platform == 'github'"
    context: ./contexts/github-specific.md
  - condition: "environment == 'production'"
    context: ./contexts/prod-only.md
```

## Testing Overlays

### Preview Merged Result

```bash
# Build with overlays (default)
faber build claude role issue-manager

# Build without overlays
faber build claude role issue-manager --no-overlays

# Compare the outputs
diff -r deployments/claude deployments/claude-no-overlay
```

### Validate Overlay Structure

Checklist:
- [ ] Directory structure correct
- [ ] Config files valid YAML
- [ ] Context files valid markdown
- [ ] No circular references
- [ ] Paths resolve correctly

## Best Practices

### DO:
- Keep overlays focused and minimal
- Document why overlay exists
- Use clear naming conventions
- Test overlay combinations
- Version control overlays

### DON'T:
- Duplicate base content unnecessarily
- Create deep nesting hierarchies
- Use overlays for temporary changes
- Mix concerns in single overlay
- Hardcode sensitive data

## Common Use Cases

### 1. Enterprise Compliance

```
organization/
├── contexts/
│   ├── standards/
│   │   ├── sox-compliance.md
│   │   ├── gdpr-requirements.md
│   │   └── security-baseline.md
│   └── references/
│       └── audit-controls.md
```

### 2. Multi-Region Deployment

```
platforms/
├── aws-us-east/
│   └── contexts/
│       └── region-config.md
├── aws-eu-west/
│   └── contexts/
│       └── region-config.md
└── aws-ap-south/
    └── contexts/
        └── region-config.md
```

### 3. Team Specialization

```
teams/
├── security-team/
│   └── contexts/
│       └── security-focus.md
├── performance-team/
│   └── contexts/
│       └── performance-focus.md
└── compliance-team/
    └── contexts/
        └── compliance-focus.md
```

## Troubleshooting

### Overlay Not Applied

Check:
1. Overlay path in config
2. Directory structure
3. Build command includes overlays
4. No typos in paths

### Conflicts Between Overlays

Resolution:
1. Check precedence order
2. Review merge strategy
3. Explicitly set in higher overlay
4. Use override instead of merge

### Performance Issues

Solutions:
1. Reduce overlay count
2. Optimize context size
3. Use conditional loading
4. Cache merged results

## Next Steps

- [Examples](examples.md) - Real overlay examples
- [Configuration](cli-reference.md#configuration-file) - Config options
- [Contributing](contributing.md) - Share your overlays