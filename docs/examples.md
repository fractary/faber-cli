# Examples and Tutorials

Real-world examples demonstrating Faber-CLI capabilities.

## Example 1: Multi-Platform Issue Manager

Build an issue management agent that works across GitHub, Linear, and Jira.

### Step 1: Create the Role

```bash
faber create role issue-manager \
  --org acme \
  --system devops \
  --platforms github-issues,linear,jira
```

### Step 2: Define Core Behavior

`roles/issue-manager/prompt.md`:
```markdown
# Issue Manager Agent

Expert at managing issues across multiple platforms with consistent workflows.

## Platform Detection
1. Check `.faber/config.yml` for `platforms.issue-manager`
2. Load platform context from `/contexts/platforms/`

## Core Capabilities
- Create and update issues
- Triage and prioritize
- Assign to team members
- Track SLAs
- Generate reports

## Available Tasks
- [create-issue](/tasks/create-issue.md)
- [triage-issues](/tasks/triage-issues.md)
- [assign-issue](/tasks/assign-issue.md)
- [generate-report](/tasks/generate-report.md)
```

### Step 3: Create Platform-Agnostic Task

`roles/issue-manager/tasks/triage-issues.md`:
```markdown
# Triage Issues

**Purpose**: Review and prioritize incoming issues.

## Inputs
- `status`: Status filter (default: "new")
- `limit`: Maximum issues to triage

## Process
1. List issues with given status
2. For each issue:
   - Analyze title and description
   - Determine priority (urgent/high/medium/low)
   - Suggest labels
   - Identify potential assignee
3. Update issues with triage results

## Output
- `triaged_count`: Number processed
- `high_priority_count`: Urgent/high issues
- `assignments`: Suggested assignments
```

### Step 4: Add Platform Contexts

`roles/issue-manager/contexts/platforms/platform-github-issues.md`:
```markdown
---
platform: github-issues
mcp_server: github
---

# GitHub Issues Platform

## Priority Mapping
- urgent → labels: ["priority: critical", "p0"]
- high → labels: ["priority: high", "p1"]
- medium → labels: ["priority: medium", "p2"]
- low → labels: ["priority: low", "p3"]

## Triage Implementation
```javascript
const issues = await mcp.call('github_list_issues', {
  state: 'open',
  labels: ['needs-triage']
});

for (const issue of issues) {
  await mcp.call('github_update_issue', {
    number: issue.number,
    labels: [...issue.labels, priorityLabel],
    assignee: suggestedAssignee
  });
}
```
```

### Step 5: Add Company Standards

`.faber/overlays/organization/contexts/standards/triage-sla.md`:
```markdown
# Triage SLA Standards

## Response Times
- P0 (Urgent): 1 hour
- P1 (High): 4 hours
- P2 (Medium): 24 hours
- P3 (Low): 72 hours

## Escalation
- P0: Immediate escalation to on-call
- P1: Notify team lead
- P2: Standard queue
- P3: Batch processing OK
```

### Step 6: Configure and Build

`.faber/config.yml`:
```yaml
platforms:
  issue-manager: github-issues  # or linear, jira

mcp_servers:
  github:
    command: npx
    args: [-y, @modelcontextprotocol/server-github]
    env:
      GITHUB_TOKEN: ${GITHUB_TOKEN}
```

```bash
faber build claude role issue-manager
```

---

## Example 2: Security Audit Team

Create a multi-agent security team.

### Step 1: Create Individual Roles

```bash
# Security scanner
faber create role security-scanner --platforms github,gitlab

# Vulnerability researcher
faber create role vuln-researcher --platforms nvd,cve

# Compliance checker
faber create role compliance-checker --platforms github
```

### Step 2: Create the Team

```bash
faber create team security-team \
  --members security-scanner,vuln-researcher,compliance-checker
```

`teams/security-team/team.yml`:
```yaml
name: security-team
members:
  - role: security-scanner
    name: scanner
    config:
      scan_depth: deep

  - role: vuln-researcher
    name: researcher
    config:
      sources: [nvd, cve, github-advisory]

  - role: compliance-checker
    name: compliance
    config:
      frameworks: [sox, gdpr, hipaa]

coordination: collaborative
workflows:
  - security-audit
  - incident-response
```

### Step 3: Define Team Workflow

`teams/security-team/workflows/security-audit.flow.md`:
```markdown
# Security Audit Workflow

## Phase 1: Scanning
**Lead**: scanner
**Actions**:
1. Scan codebase for vulnerabilities
2. Check dependencies
3. Review configurations

## Phase 2: Research
**Lead**: researcher
**Actions**:
1. Research identified vulnerabilities
2. Check CVE databases
3. Assess severity and impact

## Phase 3: Compliance
**Lead**: compliance
**Actions**:
1. Check against compliance frameworks
2. Generate compliance report
3. Identify gaps

## Phase 4: Report
**All members**
**Actions**:
1. Compile findings
2. Prioritize remediation
3. Create action plan
```

### Step 4: Add Specialist Context

`roles/security-scanner/contexts/specialists/specialist-owasp.md`:
```markdown
# OWASP Security Specialist

## Top 10 Vulnerabilities (2021)

1. **Broken Access Control**
   - Check authorization on all endpoints
   - Verify privilege escalation prevention

2. **Cryptographic Failures**
   - Scan for weak encryption
   - Check for exposed sensitive data

3. **Injection**
   - SQL injection tests
   - Command injection checks
   - XSS detection

[... rest of OWASP top 10 ...]

## Scanning Checklist
- [ ] Authentication mechanisms
- [ ] Session management
- [ ] Input validation
- [ ] Output encoding
- [ ] Cryptography usage
- [ ] Error handling
- [ ] Logging and monitoring
```

---

## Example 3: CI/CD Pipeline Workflow

Cross-team workflow for continuous deployment.

### Step 1: Create the Workflow

```bash
faber create workflow release-pipeline
```

`workflows/release-pipeline/workflow.yml`:
```yaml
name: release-pipeline
stages:
  - planning
  - development
  - testing
  - staging
  - production

teams:
  - product-team
  - dev-team
  - qa-team
  - ops-team

triggers:
  - manual
  - scheduled: "0 2 * * 1"  # Weekly Monday 2am

conditions:
  min_approval: 2
  required_tests: [unit, integration, e2e]
  staging_duration: 24h
```

### Step 2: Define Stage Transitions

`workflows/release-pipeline/stages/stage-testing.yml`:
```yaml
name: testing
team: qa-team

entry_criteria:
  - all_commits_reviewed: true
  - build_passing: true
  - coverage_threshold: 80

tasks:
  - run_unit_tests
  - run_integration_tests
  - run_e2e_tests
  - security_scan
  - performance_test

exit_criteria:
  - all_tests_passing: true
  - no_critical_vulnerabilities: true
  - performance_benchmarks_met: true

on_failure:
  - notify: dev-team
  - rollback: true
```

---

## Example 4: Platform Migration Helper

Migrate from GitHub Issues to Linear.

### Step 1: Create Migration Role

`roles/issue-migrator/prompt.md`:
```markdown
# Issue Migrator

Specializes in migrating issues between platforms.

## Migration Process
1. Extract from source platform
2. Transform to target format
3. Load into target platform
4. Verify migration
5. Generate report
```

### Step 2: Create Migration Task

`roles/issue-migrator/tasks/migrate-issues.md`:
```markdown
# Migrate Issues

## Inputs
- `source_platform`: Platform to migrate from
- `target_platform`: Platform to migrate to
- `project_mapping`: Map source to target projects
- `user_mapping`: Map source to target users

## Steps
1. Export all issues from source
2. Transform:
   - Map users
   - Map labels
   - Convert markdown
   - Adjust priorities
3. Import to target
4. Create mapping report

## Outputs
- `migrated_count`: Issues migrated
- `mapping_report`: ID mappings
- `errors`: Any failures
```

---

## Example 5: Custom Enterprise Overlay

Complete enterprise customization.

### Organization Structure

```
.faber/overlays/organization/
├── contexts/
│   ├── standards/
│   │   ├── code-style.md
│   │   ├── security-baseline.md
│   │   ├── api-guidelines.md
│   │   └── documentation.md
│   ├── references/
│   │   ├── internal-apis.md
│   │   ├── service-catalog.md
│   │   └── team-contacts.md
│   └── playbooks/
│       ├── incident-response.md
│       ├── release-process.md
│       └── on-call-rotation.md
└── config.yml
```

### Enterprise Config

`.faber/overlays/organization/config.yml`:
```yaml
# Enterprise-wide settings
defaults:
  approval_required: 2
  security_scan: mandatory
  test_coverage: 85

integrations:
  slack:
    webhook: ${SLACK_WEBHOOK}
    channels:
      alerts: "#ops-alerts"
      deployments: "#deployments"

  pagerduty:
    api_key: ${PAGERDUTY_KEY}
    service_id: ${PAGERDUTY_SERVICE}

compliance:
  frameworks: [sox, gdpr, hipaa]
  audit_log: required
  data_retention: 7_years
```

### Department Overlay

`.faber/overlays/departments/engineering/contexts/standards/eng-practices.md`:
```markdown
# Engineering Best Practices

## Code Review
- PR template required
- Two approvals minimum
- Must pass CI/CD
- Security review for auth changes

## Testing
- Unit tests required
- Integration tests for APIs
- E2E tests for user flows
- Performance tests for database changes

## Deployment
- Feature flags for new features
- Canary deployments (5% → 25% → 100%)
- Rollback plan documented
- Monitoring configured
```

---

## Example 6: Multi-Framework Deployment

Deploy same agent to multiple frameworks.

### Build for All Frameworks

```bash
#!/bin/bash
# build-all.sh

ROLE="issue-manager"

echo "Building $ROLE for all frameworks..."

# Claude Code
faber build claude role $ROLE --output ./deployments/claude
echo "✓ Claude Code build complete"

# LangGraph (when implemented)
# faber build langgraph role $ROLE --output ./deployments/langgraph
# echo "✓ LangGraph build complete"

# CrewAI (when implemented)
# faber build crewai role $ROLE --output ./deployments/crewai
# echo "✓ CrewAI build complete"

echo "All builds complete!"
```

### Compare Outputs

```bash
# Compare generated files
diff deployments/claude/.claude/agents/issue-manager.md \
     deployments/langgraph/graphs/issue_manager.py

# Check file sizes
du -sh deployments/*

# Validate each build
faber validate role issue-manager --binding claude
faber validate role issue-manager --binding langgraph
```

---

## Tips and Tricks

### 1. Context Debugging

Add debug contexts during development:

```markdown
# contexts/debug/debug-logging.md
## Debug Mode
- Log all MCP calls
- Print context loading order
- Show overlay resolution
- Trace task execution
```

### 2. Testing Overlays

Create test overlays:

```bash
# Test with different overlays
OVERLAY_PATH=.faber/overlays-test faber build claude role issue-manager
```

### 3. Platform Switching

Quick platform switching:

```bash
# Switch platform via environment
PLATFORM=linear faber build claude role issue-manager

# Or update config
faber config set platforms.issue-manager linear
```

### 4. Batch Operations

Process multiple concepts:

```bash
# Build all roles
for role in roles/*/; do
  name=$(basename $role)
  faber build claude role $name
done
```

### 5. CI/CD Integration

GitHub Actions example:

```yaml
name: Build Faber Agents
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Install Faber
        run: npm install -g @fractary/faber

      - name: Validate Roles
        run: |
          for role in roles/*/; do
            faber validate role $(basename $role)
          done

      - name: Build Deployments
        run: faber build claude role issue-manager

      - name: Upload Artifacts
        uses: actions/upload-artifact@v2
        with:
          name: deployments
          path: deployments/
```

## Next Steps

- [Contributing](contributing.md) - Share your examples
- [API Reference](api.md) - Programmatic usage
- [Overlay System](overlays.md) - Advanced customization