---
spec: SPEC-0002
title: Concept System - Five First-Class Orchestration Concepts
status: draft
created: 2025-01-19
updated: 2025-01-19
authors: [Fractary Team]
---

# Concept System - Five First-Class Orchestration Concepts

## Overview

Faber-CLI manages five first-class orchestration concepts, each with its own directory structure, metadata format, and lifecycle. This specification defines these concepts, their relationships, and how they compose together.

## Motivation

Rather than only supporting agent roles, a comprehensive orchestration platform needs:
- **Roles**: Agent definitions
- **Tools**: Utilities and MCP servers
- **Evals**: Testing and validation
- **Teams**: Multi-agent compositions
- **Workflows**: Cross-team orchestrations

Each concept is first-class with consistent patterns for metadata, customization, and deployment.

## Design

### The Five Concepts

#### 1. Roles (Agent Definitions)

**Purpose**: Define AI agent roles with specialized capabilities, contexts, and platform adaptations.

**Directory**: `roles/{role-name}/`

**Use Cases**:
- Issue manager (GitHub Issues, Linear, Jira)
- Repository manager (GitHub, GitLab, Bitbucket)
- CI/CD manager (GitHub Actions, GitLab CI, Jenkins)
- Security auditor
- Code reviewer

#### 2. Tools (MCP Servers & Utilities)

**Purpose**: Define tool servers (MCP), utilities, and platform integrations.

**Directory**: `tools/{tool-name}/`

**Use Cases**:
- MCP servers for platforms (Linear, GitHub, Jira)
- File search utilities
- Code analysis tools
- API clients
- Custom integrations

#### 3. Evals (Evaluation Scenarios)

**Purpose**: Define test scenarios and evaluation criteria for roles and teams.

**Directory**: `evals/{eval-name}/`

**Use Cases**:
- Security review evaluation
- Code quality assessment
- Issue triage accuracy
- Sprint planning effectiveness
- Multi-platform compatibility tests

#### 4. Teams (Multi-Agent Orchestrations)

**Purpose**: Compose multiple roles into coordinated teams.

**Directory**: `teams/{team-name}/`

**Use Cases**:
- Release team (repo-manager + ci-manager + deployment-manager)
- Development squad (issue-manager + code-reviewer + tester)
- Security team (security-auditor + vulnerability-scanner)
- Support team (issue-manager + customer-liaison)

#### 5. Workflows (Cross-Team Orchestrations)

**Purpose**: Define high-level workflows that span multiple teams.

**Directory**: `workflows/{workflow-name}/`

**Use Cases**:
- Release pipeline (planning → development → qa → deployment)
- Incident response (detection → triage → remediation → postmortem)
- Feature development (design → implementation → review → release)
- Security audit (scan → review → remediation → verification)

### Concept Metadata Schemas

Each concept has a YAML metadata file with a common structure:

#### Common Fields (All Concepts)

```yaml
org: string                # Organization (e.g., "fractary", "acme")
system: string             # System namespace (e.g., "devops", "security")
name: string               # Unique name within system
type: string               # "role" | "tool" | "eval" | "team" | "workflow"
description: string        # Human-readable description
created: date              # ISO 8601 date
updated: date              # ISO 8601 date
visibility: string         # "public" | "internal" | "private"
tags: string[]             # Categorization tags
```

#### Role-Specific Fields (agent.yml)

```yaml
# Platform support
platforms: string[]        # Supported platforms ["github", "gitlab", ...]
default_platform: string   # Default if not configured
platform_config_key: string # Key in .faber/config.yml

# Metadata
color: string              # UI color hint
agent_type: string         # "autonomous" | "interactive" | "batch"
```

#### Tool-Specific Fields (tool.yml)

```yaml
# Tool type
tool_type: string          # "mcp-server" | "utility" | "api-client"
mcp_server: boolean        # Is this an MCP server?

# Platform implementations
platforms: string[]        # Platform variants ["nodejs", "python", "docker"]
default_platform: string   # Default implementation

# Protocols
protocols: string[]        # ["mcp", "openai-function", "anthropic-tool"]
```

#### Eval-Specific Fields (eval.yml)

```yaml
# Evaluation targets
targets: string[]          # ["role:repo-manager", "team:release-team"]

# Platforms to test
platforms: string[]        # ["github", "gitlab", ...]

# Metrics
metrics: string[]          # ["accuracy", "completeness", "latency"]

# Success criteria
success_threshold: number  # Minimum passing score (0-100)
```

#### Team-Specific Fields (team.yml)

```yaml
# Team composition
members: object[]          # Role assignments
  - role: string           # Role reference
    name: string           # Member name/identifier
    config: object         # Member-specific config

# Coordination
coordination: string       # "hierarchical" | "collaborative" | "sequential"
leader: string             # Optional leader member name

# Platform configuration
platform_config_key: string # Key in .faber/config.yml
```

#### Workflow-Specific Fields (workflow.yml)

```yaml
# Workflow stages
stages: string[]           # ["planning", "execution", "verification"]

# Team assignments
teams: string[]            # Team references ["release-team", "qa-team"]

# Triggers
triggers: string[]         # ["manual", "scheduled", "event-driven"]
schedule: string           # Cron expression (if scheduled)

# Conditions
conditions: object         # Workflow execution conditions
```

### Directory Structure by Concept

#### Role Structure

```
roles/{role-name}/
  agent.yml              # Role metadata
  prompt.md              # Core prompt with context loading
  README.md              # Human documentation

  tasks/                 # Atomic operations (platform-agnostic)
    {task-name}.md

  flows/                 # Composite workflows (platform-agnostic)
    {flow-name}.md

  contexts/              # Context library
    specialists/         # Expertise contexts
    platforms/           # Platform-specific (MCP adapters)
    standards/           # Best practices
    patterns/            # Design patterns
    playbooks/           # Operational procedures
    references/          # API/framework docs
    troubleshooting/     # Issue resolution

  bindings/              # Custom binding overrides (optional)
    {framework}.binding.yml
```

#### Tool Structure

```
tools/{tool-name}/
  tool.yml               # Tool metadata
  README.md              # Documentation

  mcp/                   # MCP server definition (if MCP server)
    server.json          # MCP server config
    handlers/            # Tool handlers
      {tool}.ts

  platforms/             # Platform-specific implementations
    platform-{name}.ts

  bindings/              # Custom binding overrides (optional)
    {framework}.binding.yml
```

#### Eval Structure

```
evals/{eval-name}/
  eval.yml               # Eval metadata
  README.md              # Documentation

  scenarios/             # Test scenarios
    scenario-{name}.yml

  expectations/          # Expected behaviors
    success-criteria.md
    failure-patterns.md

  platforms/             # Platform-specific test data
    platform-{name}-data.json

  bindings/              # Custom binding overrides (optional)
    {framework}.binding.yml
```

#### Team Structure

```
teams/{team-name}/
  team.yml               # Team metadata
  README.md              # Documentation

  members/               # Role assignments with config
    {member-name}.role.yml

  workflows/             # Team workflows
    {workflow-name}.flow.md

  coordination/          # Inter-agent protocols
    handoff-rules.yml
    escalation-policy.yml

  platforms/             # Team-level platform configs
    platform-{name}.yml

  bindings/              # Custom binding overrides (optional)
    {framework}.binding.yml
```

#### Workflow Structure

```
workflows/{workflow-name}/
  workflow.yml           # Workflow metadata
  README.md              # Documentation

  stages/                # Workflow stages
    stage-{name}.yml

  teams/                 # Team assignments per stage
    {stage}-teams.yml

  triggers/              # Workflow triggers
    manual.yml
    scheduled.yml
    event-driven.yml

  bindings/              # Custom binding overrides (optional)
    {framework}.binding.yml
```

### Concept Relationships and Composition

#### Relationship Hierarchy

```
Workflows
  └─ compose → Teams
       └─ compose → Roles
            └─ use → Tools
                     └─ tested by → Evals
```

#### Composition Examples

**Team Composition**:
```yaml
# teams/release-team/team.yml
members:
  - role: repo-manager
    name: scm-lead
  - role: ci-manager
    name: pipeline-manager
  - role: deployment-manager
    name: deploy-lead
```

**Workflow Composition**:
```yaml
# workflows/release-pipeline/workflow.yml
stages:
  - planning
  - execution
  - verification

teams:
  - release-team      # Used in execution stage
  - qa-team           # Used in verification stage
```

**Role Tool Usage**:
```yaml
# roles/issue-manager/contexts/platforms/platform-linear.md
# References tool: mcp-server-linear
```

**Eval Target**:
```yaml
# evals/security-review/eval.yml
targets:
  - role:repo-manager
  - role:security-auditor
  - team:security-team
```

### Concept Lifecycle

#### 1. Creation
```bash
faber create role issue-manager --platforms github-issues,linear
faber create tool mcp-server-linear --type mcp-server
faber create team release-team --members repo-manager,ci-manager
```

#### 2. Validation
```bash
faber validate role issue-manager
faber validate team release-team
```

#### 3. Building
```bash
faber build claude role issue-manager
faber build claude team release-team
```

#### 4. Deployment
```bash
faber deploy role issue-manager claude --target ~/projects/myapp
```

### Concept Discovery and Listing

#### Directory-Based Discovery

Faber-CLI automatically discovers concepts by scanning directories:
- `roles/` → Discover all roles
- `tools/` → Discover all tools
- `evals/` → Discover all evals
- `teams/` → Discover all teams
- `workflows/` → Discover all workflows

#### Metadata-Based Validation

Each concept directory must contain:
- Metadata file with `type` field matching directory
- README.md documentation
- Required subdirectories based on type

#### Listing Commands

```bash
faber list                    # All concepts
faber list roles              # All roles
faber list tools --type mcp-server  # Filter by type
faber list teams              # All teams
```

### Cross-Concept References

#### Reference Format

Concepts reference each other using the format: `{type}:{name}`

Examples:
- `role:issue-manager`
- `tool:mcp-server-linear`
- `team:release-team`

#### Reference Resolution

References are resolved during:
1. **Validation**: Ensure referenced concepts exist
2. **Building**: Load referenced concept metadata
3. **Deployment**: Include referenced concept dependencies

#### Example: Team References Roles

```yaml
# teams/release-team/team.yml
members:
  - role: repo-manager        # Reference: role:repo-manager
    name: scm-lead
```

During build:
1. Load `teams/release-team/team.yml`
2. Resolve reference `role:repo-manager`
3. Load `roles/repo-manager/agent.yml`
4. Include both in deployment

## Examples

### Example 1: Role with Tool Dependency

**Role**: `roles/issue-manager/agent.yml`
```yaml
org: fractary
system: devops
name: issue-manager
type: role
platforms:
  - github-issues
  - linear
  - jira
```

**Platform Context**: `roles/issue-manager/contexts/platforms/platform-linear.md`
```markdown
---
platform: linear
mcp_server: mcp-server-linear    # References tool:mcp-server-linear
---
```

**Tool**: `tools/mcp-server-linear/tool.yml`
```yaml
org: fractary
system: integrations
name: mcp-server-linear
type: tool
tool_type: mcp-server
mcp_server: true
```

### Example 2: Team Composing Roles

**Team**: `teams/release-team/team.yml`
```yaml
org: fractary
system: engineering
name: release-team
type: team
members:
  - role: repo-manager          # Reference: role:repo-manager
    name: scm-lead
  - role: ci-manager            # Reference: role:ci-manager
    name: pipeline-manager
  - role: deployment-manager    # Reference: role:deployment-manager
    name: deploy-lead
coordination: hierarchical
```

### Example 3: Eval Testing Role

**Eval**: `evals/issue-workflow-test/eval.yml`
```yaml
org: fractary
system: testing
name: issue-workflow-test
type: eval
targets:
  - role:issue-manager          # Reference: role:issue-manager
platforms:
  - linear
  - github-issues
metrics:
  - accuracy
  - completeness
success_threshold: 80
```

## Implementation Notes

### Type System

```typescript
enum ConceptType {
  ROLE = 'role',
  TOOL = 'tool',
  EVAL = 'eval',
  TEAM = 'team',
  WORKFLOW = 'workflow'
}

interface ConceptMetadata {
  org: string;
  system: string;
  name: string;
  type: ConceptType;
  description: string;
  created: string;
  updated: string;
  visibility: 'public' | 'internal' | 'private';
  tags: string[];
}

interface ConceptReference {
  type: ConceptType;
  name: string;
}
```

### Validation Rules

Each concept type has specific validation rules:

**Role**:
- Must have agent.yml
- Must have prompt.md
- Must have at least one task or flow
- Platform declarations must be valid

**Tool**:
- Must have tool.yml
- If MCP server, must have mcp/server.json
- Must have at least one implementation

**Eval**:
- Must have eval.yml
- Must have at least one scenario
- Targets must reference valid concepts

**Team**:
- Must have team.yml
- Must have at least one member
- Member role references must be valid

**Workflow**:
- Must have workflow.yml
- Must have at least one stage
- Team references must be valid

## Open Questions

1. Should concepts support versioning in metadata (e.g., `version: "1.0.0"`)?
2. Should there be a concept dependency graph visualization?
3. Should concepts support inheritance (e.g., role extends another role)?

## References

- [SPEC-0001: Faber-CLI Overview](./SPEC-0001-faber-cli-overview.md)
- [SPEC-0003: Role Structure](./SPEC-0003-role-structure.md)
- [SPEC-0014: Validation System](./SPEC-0014-validation-system.md)
