---
spec: SPEC-0003
title: Role Structure - Agent Definition Anatomy
status: draft
created: 2025-01-19
updated: 2025-01-19
authors: [Fractary Team]
implementation_status: complete
implementation_notes: |
  Fully implemented. RoleLoader supports all features: metadata validation,
  prompt loading, tasks, flows, contexts (all 7 categories), custom bindings,
  platform validation, and context reference extraction.
---

# Role Structure - Agent Definition Anatomy

## Overview

Roles are the primary concept in Faber-CLI, representing AI agent definitions. This specification defines the complete structure of a role, including metadata, prompts, tasks, flows, contexts, and bindings.

## Motivation

A role needs to be:
- **Self-contained**: Everything needed to understand and deploy the agent
- **Platform-agnostic**: Tasks and flows work across platforms
- **Framework-agnostic**: Can be deployed to any framework via bindings
- **Customizable**: Supports overlays without source modification
- **Contextual**: Dynamically loads relevant contexts as needed

## Design

### Role Directory Structure

```
roles/{role-name}/
  agent.yml              # Role metadata and configuration
  prompt.md              # Core prompt with context loading logic
  README.md              # Human-readable documentation

  tasks/                 # Atomic operations (platform-agnostic)
    {task-name}.md       # Individual task definitions

  flows/                 # Composite workflows (platform-agnostic)
    {flow-name}.md       # Multi-task workflows

  contexts/              # Context library (categorized)
    specialists/         # Expertise/specialty contexts
      specialist-{name}.md
    platforms/           # Platform-specific contexts (MCP adapters)
      platform-{name}.md
    standards/           # Best practices and standards
      standards-{name}.md
    patterns/            # Design patterns and architectures
      patterns-{name}.md
    playbooks/           # Operational procedures
      playbook-{name}.md
    references/          # API/framework references
      reference-{name}.md
    troubleshooting/     # Issue resolution guides
      troubleshooting-{name}.md

  bindings/              # Custom binding overrides (optional)
    {framework}.binding.yml
```

### agent.yml Schema

```yaml
# Required fields
org: string                     # Organization namespace
system: string                  # System namespace
name: string                    # Unique role name
type: "role"                    # Concept type (always "role")
description: string             # Human-readable description

# Platform support
platforms: string[]             # Supported platforms
default_platform: string        # Default if not configured
platform_config_key: string     # Config lookup key

# Optional metadata
color: string                   # UI color hint (e.g., "blue", "#3B82F6")
agent_type: string              # "autonomous" | "interactive" | "batch"
tags: string[]                  # Categorization tags
created: string                 # ISO 8601 date
updated: string                 # ISO 8601 date
visibility: string              # "public" | "internal" | "private"
```

### agent.yml Example

```yaml
org: fractary
system: devops
name: issue-manager
type: role
description: Manages issue tracking across multiple platforms (GitHub Issues, Linear, Jira)

# Platform support
platforms:
  - github-issues
  - linear
  - jira
default_platform: github-issues
platform_config_key: issue-manager

# Metadata
color: blue
agent_type: autonomous
tags:
  - issues
  - project-management
  - tracking
created: 2025-01-15
updated: 2025-01-19
visibility: public
```

### prompt.md Structure

The core prompt defines the agent's identity and context loading logic.

**Required Sections**:
1. **Agent Identity**: Who the agent is, core purpose
2. **Platform Detection**: How to detect and load platform context
3. **Context Loading**: What contexts to load and when
4. **Overlay Loading**: How to load organization/role overlays
5. **Task/Flow Reference**: Available operations
6. **Behavior Guidelines**: Operational rules

**Example Structure**:

```markdown
# Issue Manager Agent

You are an issue manager agent that handles issue tracking across multiple platforms.

## Platform Detection and Context Loading

**CRITICAL - First Step**: Detect configured platform and load appropriate context.

1. Check `.faber/config.yml` for `platforms.issue-manager`
2. Load corresponding platform context:
   - **github-issues** → `/contexts/platforms/platform-github-issues.md`
   - **linear** → `/contexts/platforms/platform-linear.md`
   - **jira** → `/contexts/platforms/platform-jira.md`
3. If not configured, use default: github-issues

## Specialist Context Loading (Load as Needed)

Based on user request, load relevant specialist contexts:
- Sprint planning → `/contexts/specialists/specialist-sprint-planning.md`
- Bug triage → `/contexts/specialists/specialist-bug-triage.md`
- Roadmap planning → `/contexts/specialists/specialist-roadmap.md`

## Standard Practices (Always Apply)

Reference for all operations:
- `/contexts/standards/standards-issue-templates.md`
- `/contexts/standards/standards-priority-levels.md`

## Overlay Loading (If Provided)

**IMPORTANT**: Check for and load overlay contexts:

### Organization-Level Overlays (Always load if present)
```
/.faber/overlays/organization/contexts/standards/*.md
/.faber/overlays/organization/contexts/references/*.md
```

### Platform Overlays (Load if present for configured platform)
```
/.faber/overlays/platforms/{configured-platform}/contexts/*.md
```

### Role Overlays (Load if present for this role)
```
/.faber/overlays/roles/issue-manager/contexts/standards/*.md
/.faber/overlays/roles/issue-manager/contexts/platforms/*.md
```

### Custom Context Injection (From config)
Load any additional contexts specified in:
```
/.faber/overlays/roles/issue-manager/config.yml -> custom_contexts[]
```

## Available Tasks

- [create-issue](/tasks/create-issue.md)
- [assign-issue](/tasks/assign-issue.md)
- [update-issue](/tasks/update-issue.md)
- [plan-sprint](/tasks/plan-sprint.md)
- [triage-bugs](/tasks/triage-bugs.md)

## Available Flows

- [sprint-planning](/flows/sprint-planning.md)
- [release-preparation](/flows/release-preparation.md)
- [bug-triage-workflow](/flows/bug-triage-workflow.md)

## Overlay Precedence Rules

When base and overlay contexts conflict:
1. **Override**: Overlay replaces base for conflicting information
2. **Merge**: Overlay adds to base for complementary information
3. **Append**: Overlay adds requirements to base requirements
```

### Task Definition Structure

**File**: `tasks/{task-name}.md`

Tasks are atomic, platform-agnostic operations.

**Structure**:
```markdown
# {Task Name}

**Purpose**: Brief description of what this task accomplishes.

## Inputs

- `{param}`: Description and type
- `{param}`: Description and type

## Outputs

- `{result}`: Description of what is returned

## Platform-Agnostic Steps

1. Step 1 (generic)
2. Step 2 (generic)
3. Step 3 (generic)

## Notes

- Important considerations
- Edge cases
- Validation requirements

## Examples

### Example 1
Input: {...}
Output: {...}
```

**Example**: `tasks/create-issue.md`

```markdown
# Create Issue

**Purpose**: Create a new issue in the configured issue tracking platform.

## Inputs

- `title`: string - Issue title/summary
- `description`: string - Detailed description
- `labels`: string[] - Optional labels/tags
- `assignees`: string[] - Optional assignees
- `priority`: string - Optional priority level

## Outputs

- `issue_id`: string - Created issue identifier
- `url`: string - URL to the created issue

## Platform-Agnostic Steps

1. Validate inputs (title required, description recommended)
2. Determine team/project based on context
3. Map priority to platform-specific values
4. Call platform-specific issue creation tool
5. Return issue ID and URL

## Notes

- Platform context provides platform-specific implementation
- Labels/tags may have different names per platform
- Priority mapping defined in platform context
- Assignees must be valid users in the platform

## Examples

### Example 1: Basic Bug Report
Input:
```yaml
title: "Login button not working"
description: "Users unable to click login button on mobile"
labels: ["bug", "mobile"]
priority: "high"
```

Output:
```yaml
issue_id: "ENG-123"  # Linear format
url: "https://linear.app/acme/issue/ENG-123"
```
```

### Flow Definition Structure

**File**: `flows/{flow-name}.md`

Flows are composite workflows that orchestrate multiple tasks.

**Structure**:
```markdown
# {Flow Name}

**Purpose**: Brief description of this workflow.

## Overview

High-level description of the flow and when to use it.

## Prerequisites

- Required context
- Required permissions
- Required information

## Flow Steps

### Step 1: {Step Name}
- **Task**: Reference to task (if applicable)
- **Action**: What to do
- **Decision Point**: Any conditional logic

### Step 2: {Step Name}
...

## Success Criteria

- What defines successful completion

## Error Handling

- How to handle common errors
- Rollback procedures (if applicable)

## Examples

Concrete examples of the flow in action.
```

**Example**: `flows/sprint-planning.md`

```markdown
# Sprint Planning Flow

**Purpose**: Plan and set up a new sprint/iteration with prioritized issues.

## Overview

This flow guides you through sprint planning: reviewing backlog, estimating issues, selecting work, and creating the sprint.

## Prerequisites

- Access to issue platform
- Backlog of issues available
- Team capacity estimates
- Sprint duration configured

## Flow Steps

### Step 1: List Current Sprint
- **Task**: N/A (platform query)
- **Action**: Get current/active sprint information
- **Decision Point**: If active sprint exists, confirm before planning next

### Step 2: Review Backlog
- **Task**: N/A (platform query)
- **Action**: List issues in backlog state
- **Decision Point**: Filter by priority/labels if needed

### Step 3: Estimate Issues
- **Context**: Load `specialist-sprint-planning.md`
- **Task**: N/A (interactive)
- **Action**: For each issue, assign estimate/story points
- **Decision Point**: Use estimation scale from platform/org overlay

### Step 4: Select Issues for Sprint
- **Action**: Based on team capacity, select issues
- **Decision Point**: Ensure total estimate <= team capacity

### Step 5: Create Sprint
- **Task**: Related to sprint creation (platform-specific)
- **Action**: Create new sprint with dates
- **Decision Point**: Confirm sprint duration from config

### Step 6: Assign Issues to Sprint
- **Task**: `update-issue` (for each selected issue)
- **Action**: Move issues from backlog to sprint
- **Decision Point**: Verify all selected issues assigned

### Step 7: Assign Issues to Team Members
- **Task**: `assign-issue` (for each issue)
- **Action**: Distribute work across team
- **Decision Point**: Balance load across team members

## Success Criteria

- New sprint created with correct dates
- All selected issues assigned to sprint
- All issues have estimates
- All issues have assignees
- Team notified of sprint start

## Error Handling

- **Sprint already exists**: Confirm before creating duplicate
- **Capacity exceeded**: Warn and confirm before over-committing
- **Missing estimates**: Prompt for estimates before adding to sprint
- **Invalid assignees**: Validate team membership

## Examples

### Example: 2-Week Sprint for Backend Team

**Context**: Team of 4 engineers, 2-week sprint, 80 story points capacity

**Steps**:
1. Current sprint ends Friday
2. Backlog has 25 issues (120 total story points)
3. Estimate top 15 issues (total: 78 story points)
4. Create sprint "Sprint 24" (Jan 22 - Feb 2)
5. Assign 15 issues to sprint
6. Distribute across team (20 points per person)
7. Post to #engineering-sprint channel
```

### Context Category Guidelines

See SPEC-0004 for detailed context system specification.

**Quick Reference**:

- **specialists/**: Expertise contexts (load on-demand based on task)
- **platforms/**: Platform-specific contexts (load based on configured platform)
- **standards/**: Best practices (often loaded by default)
- **patterns/**: Design patterns (reference material)
- **playbooks/**: Step-by-step procedures (load for specific workflows)
- **references/**: API/docs (load as needed)
- **troubleshooting/**: Issue resolution (load when errors occur)

### Custom Bindings

**File**: `bindings/{framework}.binding.yml`

Roles can override default bindings for specific frameworks.

**Example**: `bindings/claude.binding.yml`

```yaml
# Custom Claude Code binding for issue-manager role
name: claude-code
version: 1.0.0
extends: default  # Extend default Claude binding

# Custom output paths
output_structure:
  agent_path: ".claude/custom-agents/{name}.md"

# Additional files to include
additional_files:
  - source: "scripts/linear-helper.sh"
    dest: ".claude/scripts/{name}-helper.sh"

# Custom template variables
template_vars:
  auto_activate: true
  priority: high
```

## Examples

### Complete Example: issue-manager Role

**Directory Structure**:
```
roles/issue-manager/
  agent.yml
  prompt.md
  README.md

  tasks/
    create-issue.md
    assign-issue.md
    update-issue.md
    close-issue.md
    plan-sprint.md
    triage-bugs.md

  flows/
    sprint-planning.md
    bug-triage-workflow.md
    release-preparation.md

  contexts/
    specialists/
      specialist-sprint-planning.md
      specialist-bug-triage.md
      specialist-roadmap.md
    platforms/
      platform-github-issues.md
      platform-linear.md
      platform-jira.md
    standards/
      standards-issue-templates.md
      standards-priority-levels.md
    references/
      reference-linear-api.md
    troubleshooting/
      troubleshooting-auth.md

  bindings/
    claude.binding.yml
```

## Validation Rules

A valid role must:

1. **Have required files**:
   - agent.yml (valid schema)
   - prompt.md (non-empty)
   - README.md

2. **Have at least one**:
   - Task OR flow

3. **Platform declarations**:
   - If platforms declared, must have platform context for each
   - default_platform must be in platforms list

4. **Context references**:
   - All context references in prompt.md must exist
   - Platform contexts must exist in contexts/platforms/

5. **Task/flow references**:
   - All task/flow references in prompt.md must exist
   - All task references in flows must exist

6. **Metadata**:
   - org, system, name must be valid identifiers (lowercase, hyphens)
   - type must be "role"
   - created/updated must be valid ISO 8601 dates

## Implementation Notes

### Role Loader

```typescript
interface Role {
  metadata: RoleMetadata;
  prompt: string;
  tasks: Map<string, Task>;
  flows: Map<string, Flow>;
  contexts: Map<string, Context>;
  bindings: Map<string, BindingConfig>;
}

class RoleLoader {
  async load(rolePath: string): Promise<Role> {
    // Load metadata
    const metadata = await this.loadMetadata(rolePath);

    // Load prompt
    const prompt = await this.loadPrompt(rolePath);

    // Load tasks
    const tasks = await this.loadTasks(rolePath);

    // Load flows
    const flows = await this.loadFlows(rolePath);

    // Load contexts
    const contexts = await this.loadContexts(rolePath);

    // Load custom bindings
    const bindings = await this.loadBindings(rolePath);

    return { metadata, prompt, tasks, flows, contexts, bindings };
  }
}
```

### Role Validator

```typescript
class RoleValidator {
  validate(role: Role): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate metadata schema
    errors.push(...this.validateMetadata(role.metadata));

    // Validate platform declarations
    errors.push(...this.validatePlatforms(role));

    // Validate context references
    errors.push(...this.validateContextReferences(role));

    // Validate task/flow references
    errors.push(...this.validateTaskFlowReferences(role));

    return { valid: errors.length === 0, errors };
  }
}
```

## Open Questions

1. Should tasks support parameters with JSON schema validation?
2. Should flows support conditional branching (if/else)?
3. Should roles support inheritance (extend another role)?
4. Should there be a visual flow designer tool?

## References

- [SPEC-0001: Faber-CLI Overview](./SPEC-0001-faber-cli-overview.md)
- [SPEC-0002: Concept System](./SPEC-0002-concept-system.md)
- [SPEC-0004: Context System](./SPEC-0004-context-system.md)
- [SPEC-0005: Platform Abstraction](./SPEC-0005-platform-abstraction.md)
- [SPEC-0007: Overlay System](./SPEC-0007-overlay-system.md)
