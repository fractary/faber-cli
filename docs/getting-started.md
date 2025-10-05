# Getting Started with Faber-CLI

This guide will walk you through installing Faber-CLI, creating your first AI agent role, and deploying it to Claude Code.

## Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Git (optional, for version control)

## Installation

### Global Installation (Recommended)

```bash
npm install -g @fractary/faber-cli
```

### Local Development

If you want to contribute or modify Faber-CLI:

```bash
git clone https://github.com/fractary/faber-cli.git
cd faber-cli
npm install
npm run build
npm link  # Makes 'faber' command available globally
```

## Creating Your First Project

### Step 1: Initialize the Project

```bash
mkdir my-ai-agents
cd my-ai-agents
faber init
```

This creates the following structure:

```
my-ai-agents/
├── .faber/
│   ├── config.yml              # Main configuration
│   └── overlays/               # Organization customizations
│       ├── organization/       # Company-wide standards
│       ├── platforms/          # Platform-specific configs
│       ├── roles/              # Role-specific overrides
│       ├── teams/              # Team customizations
│       └── workflows/          # Workflow customizations
├── roles/                      # AI agent definitions
├── tools/                      # MCP servers and utilities
├── evals/                      # Test scenarios
├── teams/                      # Multi-agent teams
├── workflows/                  # Cross-team workflows
└── deployments/                # Build outputs
```

### Step 2: Configure Your Project

Edit `.faber/config.yml`:

```yaml
# Platform configurations
platforms:
  issue-manager: github-issues    # Use GitHub for issue management
  repo-manager: github            # Use GitHub for repository management

# MCP server configurations (optional)
mcp_servers:
  github:
    command: npx
    args: [-y, @modelcontextprotocol/server-github]
    env:
      GITHUB_TOKEN: ${GITHUB_TOKEN}

# Overlay settings
overlays:
  enabled: true
  paths:
    - .faber/overlays
```

### Step 3: Create Your First Role

Create an issue manager agent:

```bash
faber create role issue-manager \
  --org mycompany \
  --system devops \
  --platforms github-issues,linear,jira
```

This generates:

```
roles/issue-manager/
├── agent.yml           # Metadata
├── prompt.md           # Agent behavior
├── README.md           # Documentation
├── tasks/              # Atomic operations
├── flows/              # Workflows
└── contexts/           # Knowledge base
    ├── specialists/    # Domain expertise
    ├── platforms/      # Platform adapters
    ├── standards/      # Best practices
    └── ...
```

### Step 4: Define the Agent Behavior

Edit `roles/issue-manager/prompt.md`:

```markdown
# Issue Manager Agent

You are an expert issue manager that handles issue tracking across multiple platforms.

## Core Responsibilities

- Triage incoming issues
- Assign issues to team members
- Track issue progress
- Generate reports
- Manage sprint planning

## Platform Detection

**CRITICAL - First Step**: Detect configured platform and load appropriate context.

1. Check `.faber/config.yml` for `platforms.issue-manager`
2. Load platform context:
   - **github-issues** → `/contexts/platforms/platform-github-issues.md`
   - **linear** → `/contexts/platforms/platform-linear.md`
   - **jira** → `/contexts/platforms/platform-jira.md`

## Available Tasks

- [create-issue](/tasks/create-issue.md)
- [assign-issue](/tasks/assign-issue.md)
- [triage-issues](/tasks/triage-issues.md)

## Available Flows

- [sprint-planning](/flows/sprint-planning.md)
- [issue-triage](/flows/issue-triage.md)
```

### Step 5: Create a Task

Create `roles/issue-manager/tasks/create-issue.md`:

```markdown
# Create Issue

**Purpose**: Create a new issue in the configured platform.

## Inputs

- `title`: string - Issue title
- `description`: string - Detailed description
- `labels`: string[] - Issue labels
- `priority`: string - Priority level (low, medium, high, urgent)
- `assignee`: string - Optional assignee

## Outputs

- `issue_id`: string - Created issue identifier
- `url`: string - URL to the issue

## Platform-Agnostic Steps

1. Validate required inputs (title, description)
2. Map priority to platform-specific values
3. Lookup assignee ID if username provided
4. Create issue via platform API/tool
5. Return issue ID and URL

## Examples

### Bug Report
```yaml
title: "Login button not responding"
description: "Users cannot click login button on mobile Safari"
labels: ["bug", "mobile", "high-priority"]
priority: "high"
```
```

### Step 6: Add Platform Context

Create `roles/issue-manager/contexts/platforms/platform-github-issues.md`:

```markdown
---
category: platform
platform: github-issues
mcp_server: github
required_tools: [github_create_issue, github_update_issue]
---

# GitHub Issues Platform Context

## Available Tools (via MCP)

- `github_create_issue` - Create new issue
- `github_update_issue` - Update existing issue
- `github_list_issues` - List repository issues
- `github_assign_issue` - Assign issue to user

## Platform Concepts

- **Issue** - Bug report or feature request
- **Label** - Categorization tags
- **Milestone** - Sprint or release target
- **Assignee** - Responsible developer
- **Project** - Board for tracking

## Task Mappings

### Create Issue
```javascript
await mcp.call('github_create_issue', {
  owner: repo.owner,
  repo: repo.name,
  title: inputs.title,
  body: inputs.description,
  labels: inputs.labels,
  assignee: inputs.assignee
});
```
```

## Building and Deploying

### Step 1: Validate Your Role

```bash
faber validate role issue-manager
```

Expected output:
```
✓ role 'issue-manager' is valid
```

### Step 2: Build for Claude Code

```bash
faber build claude role issue-manager
```

This generates:

```
deployments/claude/
├── .claude/
│   └── agents/mycompany/devops/
│       └── issue-manager.md
├── docs/agents/mycompany/devops/issue-manager/
│   ├── contexts/
│   ├── tasks/
│   └── flows/
└── .faber/
    └── config.yml
```

### Step 3: Deploy to Your Project

Copy the generated files to your target project:

```bash
cp -r deployments/claude/.claude ~/my-project/
cp -r deployments/claude/docs ~/my-project/
```

## Adding Organization Customizations

### Create Company Standards

Create `.faber/overlays/organization/contexts/standards/company-policy.md`:

```markdown
# Company Development Standards

## Issue Management

- All issues must include customer impact assessment
- Security issues require immediate triage
- Use severity levels: SEV1 (critical), SEV2 (high), SEV3 (medium), SEV4 (low)

## Code Review Requirements

- Minimum 2 approvals for production changes
- Security review required for auth changes
- Performance testing for database changes
```

### Platform-Specific Configuration

Create `.faber/overlays/platforms/github-issues/contexts/workspace-config.md`:

```markdown
# GitHub Workspace Configuration

## Repository Settings
- Organization: mycompany
- Default labels: needs-triage, needs-review, ready
- Required templates: bug_report.md, feature_request.md

## Automation
- Auto-assign based on CODEOWNERS
- Auto-label based on file changes
- Stale issue management after 30 days
```

## Next Steps

Now that you have your first role:

1. **Create more roles** - Build a team of specialized agents
2. **Define teams** - Compose roles into collaborative teams
3. **Add workflows** - Orchestrate complex multi-step processes
4. **Explore bindings** - Try different AI frameworks
5. **Share your work** - Contribute roles to the community

## Troubleshooting

### Common Issues

**Issue**: `faber: command not found`
- Solution: Ensure global installation or use `npx @fractary/faber-cli`

**Issue**: Validation errors
- Solution: Check metadata schema and required fields

**Issue**: Build fails
- Solution: Ensure all referenced contexts and tasks exist

## Learn More

- [Core Concepts](concepts.md) - Understand the architecture
- [CLI Reference](cli-reference.md) - All available commands
- [Context System](contexts.md) - Dynamic knowledge loading
- [Overlay System](overlays.md) - Customization guide
- [Examples](examples.md) - Real-world use cases