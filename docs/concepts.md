# Core Concepts

Faber-CLI is built around five first-class orchestration concepts and three revolutionary abstraction dimensions. This guide explains these foundational elements.

## The Three-Dimensional Abstraction Model

### 1. Framework Abstraction (Bindings)

**Problem**: Different AI frameworks require different formats and structures.

**Solution**: Write once in Faber's universal format, deploy to any framework through pluggable bindings.

```
Universal Definition → [Binding] → Framework-Specific Output
                         ↓
                    Claude Code (.claude/agents/)
                    LangGraph (Python graphs)
                    CrewAI (Agent classes)
```

### 2. Platform Abstraction (Contexts + MCP)

**Problem**: Same agent needs to work with different platforms (GitHub vs GitLab, Linear vs Jira).

**Solution**: Platform contexts provide platform-specific knowledge, ideally wrapping MCP servers.

```
Generic Task → Platform Detection → Platform Context → MCP Tools → Platform API
```

### 3. Organization Abstraction (Overlays)

**Problem**: Organizations need to inject company standards without forking.

**Solution**: Overlay system allows adding custom contexts and configurations without modifying source.

```
Base Role + Organization Overlay + Platform Overlay → Customized Deployment
```

## The Five First-Class Concepts

### 1. Roles (AI Agents)

Roles are AI agent definitions containing:
- **Metadata** - Identity and configuration
- **Prompt** - Core behavior and context loading logic
- **Tasks** - Atomic, platform-agnostic operations
- **Flows** - Composite workflows
- **Contexts** - Knowledge library (7 categories)
- **Bindings** - Optional framework overrides

**Example Structure**:
```
roles/issue-manager/
├── agent.yml           # Metadata
├── prompt.md           # Behavior
├── tasks/              # Operations
├── flows/              # Workflows
└── contexts/           # Knowledge
```

### 2. Tools (MCP Servers & Utilities)

Tools provide platform integrations and utilities:
- **MCP Servers** - Standard protocol for platform APIs
- **Utilities** - Helper functions and scripts
- **API Clients** - Direct platform integrations

**Example**: MCP server for Linear
```yaml
# tools/mcp-server-linear/tool.yml
name: mcp-server-linear
tool_type: mcp-server
mcp_server: true
protocols: [mcp]
```

### 3. Evals (Testing Scenarios)

Evals define test scenarios for roles and teams:
- **Scenarios** - Test cases
- **Expectations** - Success criteria
- **Metrics** - Performance measures
- **Platform Tests** - Multi-platform validation

**Example**: Security audit evaluation
```yaml
# evals/security-review/eval.yml
targets: [role:security-auditor]
platforms: [github, gitlab]
metrics: [accuracy, coverage]
success_threshold: 90
```

### 4. Teams (Multi-Agent Compositions)

Teams compose multiple roles into coordinated groups:
- **Members** - Role assignments
- **Coordination** - Interaction patterns
- **Workflows** - Team-specific processes
- **Leadership** - Optional hierarchy

**Example**: Release team
```yaml
# teams/release-team/team.yml
members:
  - role: repo-manager
    name: scm-lead
  - role: ci-manager
    name: pipeline-manager
  - role: qa-engineer
    name: quality-lead
coordination: hierarchical
leader: scm-lead
```

### 5. Workflows (Cross-Team Orchestrations)

Workflows define high-level processes spanning teams:
- **Stages** - Process phases
- **Teams** - Participating teams
- **Triggers** - Activation conditions
- **Handoffs** - Inter-team communication

**Example**: Release pipeline
```yaml
# workflows/release-pipeline/workflow.yml
stages: [planning, development, testing, deployment]
teams: [product-team, dev-team, qa-team, ops-team]
triggers: [manual, scheduled]
```

## The Seven Context Categories

Contexts are the knowledge system that makes agents intelligent. They're organized into seven categories:

### 1. Specialists
**Purpose**: Domain expertise loaded on-demand
**When**: User request requires specific knowledge
**Examples**: `specialist-security.md`, `specialist-performance.md`

### 2. Platforms
**Purpose**: Platform-specific adapters (MCP)
**When**: Based on configuration
**Examples**: `platform-github.md`, `platform-linear.md`

### 3. Standards
**Purpose**: Best practices and conventions
**When**: Often loaded by default
**Examples**: `standards-code-review.md`, `standards-security.md`

### 4. Patterns
**Purpose**: Design patterns and architectures
**When**: Implementation guidance needed
**Examples**: `patterns-microservices.md`, `patterns-event-driven.md`

### 5. Playbooks
**Purpose**: Step-by-step procedures
**When**: Executing specific workflows
**Examples**: `playbook-incident-response.md`, `playbook-deployment.md`

### 6. References
**Purpose**: API and framework documentation
**When**: Technical details needed
**Examples**: `reference-github-api.md`, `reference-kubernetes.md`

### 7. Troubleshooting
**Purpose**: Issue resolution guides
**When**: Errors occur
**Examples**: `troubleshooting-auth.md`, `troubleshooting-network.md`

## How Concepts Compose

### Hierarchy

```
Workflows
  └─ compose → Teams
       └─ compose → Roles
            └─ use → Tools
                     └─ tested by → Evals
```

### Example Composition

**Workflow**: Customer Issue Resolution
```yaml
stages: [triage, investigation, resolution, followup]
teams: [support-team, dev-team, qa-team]
```

**Team**: Support Team
```yaml
members:
  - role: issue-manager
  - role: customer-liaison
  - role: technical-writer
```

**Role**: Issue Manager
```yaml
platforms: [linear, jira]
contexts:
  - platform-linear.md
  - specialist-triage.md
  - standards-sla.md
```

## Configuration Cascade

Settings and contexts cascade through multiple levels:

1. **Base Definition** - Core role/team/workflow
2. **Organization Overlay** - Company-wide standards
3. **Platform Overlay** - Platform-specific configs
4. **Role/Team Overlay** - Specific customizations
5. **Runtime Config** - Environment variables

Each level can override or extend the previous, enabling precise customization without code duplication.

## Platform Detection Flow

1. **Check Configuration**
   ```yaml
   platforms:
     issue-manager: linear  # This role uses Linear
   ```

2. **Load Platform Context**
   ```
   /contexts/platforms/platform-linear.md
   ```

3. **Initialize MCP Server**
   ```yaml
   mcp_server: mcp-server-linear
   ```

4. **Map Generic Tasks**
   ```
   create-issue → linear_create_issue (MCP tool)
   ```

## Binding Transformation Pipeline

1. **Load Base Definition**
   - Metadata, prompt, tasks, flows, contexts

2. **Apply Overlays**
   - Organization, platform, role-specific

3. **Resolve Binding**
   - Built-in or custom binding configuration

4. **Transform**
   - Apply templates, generate framework code

5. **Deploy**
   - Write artifacts to deployment directory

## Best Practices

### Role Design
- Keep roles focused on a single responsibility
- Use composition (teams) for complex scenarios
- Define clear platform-agnostic tasks
- Load contexts dynamically

### Context Organization
- Use proper categories for maintainability
- Keep contexts concise and focused
- Include examples in contexts
- Version contexts if needed

### Overlay Usage
- Organization: Company-wide standards
- Platform: Instance-specific configs
- Role: Role-specific customizations
- Avoid deep nesting

### Platform Abstraction
- Define generic tasks first
- Map to platform specifics in contexts
- Prefer MCP servers over direct APIs
- Handle platform limitations gracefully

## Advanced Concepts

### Context Frontmatter

Contexts can include metadata:
```yaml
---
category: specialist
name: security
related: [standards-security.md]
requires_mcp: [security-scanner]
---
```

### Custom Bindings

Override default bindings per role:
```yaml
# roles/special-agent/bindings/claude.binding.yml
extends: default
output_structure:
  role_path: .claude/special/{name}.md
```

### Multi-Platform Support

Roles can adapt to multiple platforms:
```yaml
platforms: [github, gitlab, bitbucket]
default_platform: github
platform_config_key: source-control
```

### Dynamic Specialist Loading

Load specialists based on keywords:
```javascript
if (request.includes("security")) {
  loadContext("specialist-security.md");
}
```

## Common Patterns

### The Platform Adapter Pattern
Generic task → Platform context → MCP tool → Platform API

### The Overlay Cascade Pattern
Base → Organization → Platform → Role → Runtime

### The Context Composition Pattern
Platform + Standards + Specialist + Troubleshooting

### The Team Coordination Pattern
Hierarchical | Collaborative | Sequential | Autonomous

## Next Steps

- [Context System](contexts.md) - Deep dive into context loading
- [Overlay System](overlays.md) - Master customization
- [Binding System](bindings.md) - Create custom bindings
- [Examples](examples.md) - See concepts in action