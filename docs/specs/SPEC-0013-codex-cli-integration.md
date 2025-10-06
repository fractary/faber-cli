# SPEC-0013: Codex CLI Integration

**Status**: Draft
**Created**: 2025-10-06
**Updated**: 2025-10-06

## Overview

This specification defines the integration of Fractary Codex into the unified Fractary CLI. Codex is a centralized knowledge management and distribution platform that enables organizations to maintain a single source of truth for documentation, AI tools, and organizational knowledge across all projects.

The Codex CLI provides local tools for validating, parsing, and analyzing Codex metadata and routing rules before syncing with remote repositories.

### Related Systems

- **@fractary/codex SDK** - Core business logic for metadata parsing, pattern matching, and routing
- **forge-bundle-codex-github-core** - GitHub Actions workflows for automated sync operations
- **forge-bundle-codex-claude-agents** - Claude Code agents for triggering sync workflows

### Goals

1. Provide local validation and analysis tools for Codex metadata
2. Enable developers to test routing rules before committing
3. Offer clear visibility into which files will sync to which repositories
4. Support configuration management and troubleshooting
5. Lay foundation for future local sync operations

### Non-Goals (Initial Release)

- Direct GitHub Actions integration (use existing bundles)
- Real-time file watching/syncing
- Git operations (pull/push/commit)
- Web UI or dashboard

## Architecture

### Package Dependencies

```json
{
  "dependencies": {
    "@fractary/codex": "^0.1.0",
    "chalk": "^5.3.0",
    "commander": "^11.1.0"
  }
}
```

### Directory Structure

```
fractary-cli/
├── src/
│   └── tools/
│       └── codex/
│           ├── index.ts              # Command builder
│           ├── commands/
│           │   ├── init.ts           # Initialize Codex project
│           │   ├── validate.ts       # Validate metadata
│           │   ├── parse.ts          # Parse and display metadata
│           │   ├── route.ts          # Show routing decisions
│           │   ├── config.ts         # Configuration management
│           │   ├── list.ts           # List files with metadata
│           │   └── check.ts          # Check sync status
│           └── utils/
│               ├── file-scanner.ts   # Scan directories for files
│               ├── output-formatter.ts # Format command output
│               └── validation-reporter.ts # Report validation errors
```

## Commands

### 1. `fractary codex init`

Initialize a Codex project with configuration and directory structure.

**Usage:**
```bash
fractary codex init [options]
```

**Options:**
- `--org <slug>` - Organization slug (e.g., 'fractary')
- `--repo <name>` - Repository name (e.g., 'codex.fractary.com')
- `--force` - Overwrite existing configuration

**Behavior:**
1. Detect organization from repo name or use provided slug
2. Create `.fractary/` directory structure
3. Generate `.fractary/codex.config.json` with defaults
4. Create example documentation file with frontmatter
5. Display next steps

**Example:**
```bash
fractary codex init --org fractary
```

**Output Structure:**
```
.fractary/
├── codex.config.json
├── systems/
└── README.md

docs/
└── example-guide.md  # With sample frontmatter
```

### 2. `fractary codex validate`

Validate frontmatter metadata in markdown files.

**Usage:**
```bash
fractary codex validate [path] [options]
```

**Arguments:**
- `path` - File or directory to validate (default: current directory)

**Options:**
- `--pattern <glob>` - Glob pattern to match files (default: "**/*.md")
- `--strict` - Enable strict validation (fail on warnings)
- `--json` - Output results as JSON

**Behavior:**
1. Scan for markdown files matching pattern
2. Parse YAML frontmatter using SDK
3. Validate against Codex schema
4. Report errors and warnings
5. Exit with non-zero code if validation fails

**Example:**
```bash
fractary codex validate docs/
fractary codex validate docs/api-guide.md
fractary codex validate --pattern "docs/**/*.md" --strict
```

**Output:**
```
Validating Codex metadata...

✓ docs/api-guide.md
  - org: fractary
  - system: api-gateway
  - includes: api-*, core-*
  - excludes: *-test

✗ docs/broken.md
  - Error: Invalid codex_sync_include format
  - Error: Missing required field 'org'

⚠ docs/incomplete.md
  - Warning: No sync rules defined (will not sync)

Summary: 1 valid, 1 error, 1 warning
```

### 3. `fractary codex parse`

Parse and display frontmatter metadata from files.

**Usage:**
```bash
fractary codex parse <file> [options]
```

**Arguments:**
- `file` - Markdown file to parse (required)

**Options:**
- `--json` - Output as JSON
- `--yaml` - Output as YAML
- `--raw` - Show raw frontmatter only

**Behavior:**
1. Read file and extract frontmatter
2. Parse metadata using SDK
3. Display structured output
4. Show content preview (optional)

**Example:**
```bash
fractary codex parse docs/api-guide.md
fractary codex parse docs/api-guide.md --json
```

**Output:**
```
File: docs/api-guide.md

Metadata:
  org: fractary
  system: api-gateway
  title: API Integration Guide
  description: Guide for integrating with the API
  codex_sync_include:
    - api-*
    - core-*
  codex_sync_exclude:
    - *-test
    - *-dev
  visibility: internal
  tags:
    - api
    - rest
    - integration
  created: 2025-10-01
  updated: 2025-10-06

Content Preview:
  # API Integration Guide

  This guide covers the fundamentals of integrating...
```

### 4. `fractary codex route`

Show which repositories a file will sync to based on routing rules.

**Usage:**
```bash
fractary codex route <file> [options]
```

**Arguments:**
- `file` - Markdown file to analyze (required)

**Options:**
- `--repos <list>` - Comma-separated list of repos to test against
- `--all` - Test against all known repos in organization
- `--json` - Output as JSON

**Behavior:**
1. Parse file metadata
2. Load configuration and routing rules
3. Evaluate sync rules for each target repository
4. Display which repos will receive the file
5. Show reasoning for each decision

**Example:**
```bash
fractary codex route docs/api-guide.md
fractary codex route docs/api-guide.md --repos api-gateway,web-app,mobile-app
```

**Output:**
```
File: docs/api-guide.md

Routing Analysis:

✓ api-gateway
  Reason: Matches include pattern 'api-*'

✓ core-services
  Reason: Matches include pattern 'core-*'

✗ web-app
  Reason: No matching include patterns

✗ test-harness
  Reason: Matches exclude pattern '*-test'

Summary: Will sync to 2 repositories (api-gateway, core-services)
```

### 5. `fractary codex config`

View or edit Codex configuration.

**Usage:**
```bash
fractary codex config <action> [options]
```

**Actions:**
- `show` - Display current configuration
- `get <key>` - Get specific config value
- `set <key> <value>` - Set config value
- `validate` - Validate configuration file

**Options:**
- `--json` - Output as JSON
- `--global` - Use global config (future)

**Behavior:**
1. Load configuration from `.fractary/codex.config.json`
2. Perform requested action
3. Display results

**Example:**
```bash
fractary codex config show
fractary codex config get organizationSlug
fractary codex config set organizationSlug fractary
fractary codex config validate
```

**Output:**
```
Codex Configuration

Organization:
  slug: fractary

Directories:
  source: .fractary
  target: .fractary
  systems: .fractary/systems

Rules:
  preventSelfSync: true
  preventCodexSync: true
  allowProjectOverrides: true
  autoSyncPatterns: []

Source: .fractary/codex.config.json
```

### 6. `fractary codex list`

List all files with Codex metadata.

**Usage:**
```bash
fractary codex list [options]
```

**Options:**
- `--pattern <glob>` - File pattern to match (default: "**/*.md")
- `--system <name>` - Filter by system name
- `--tag <name>` - Filter by tag
- `--visibility <level>` - Filter by visibility (public, internal, private)
- `--json` - Output as JSON

**Behavior:**
1. Scan for markdown files
2. Parse frontmatter from each
3. Filter based on criteria
4. Display summary list

**Example:**
```bash
fractary codex list
fractary codex list --system api-gateway
fractary codex list --tag security --visibility internal
```

**Output:**
```
Files with Codex metadata:

docs/api-guide.md
  system: api-gateway
  tags: api, rest
  visibility: internal
  syncs to: api-*, core-*

docs/security-policy.md
  system: security
  tags: security, policy
  visibility: internal
  syncs to: *

docs/public-readme.md
  system: www
  tags: docs, public
  visibility: public
  syncs to: www-*, *-public

Found 3 files with Codex metadata
```

### 7. `fractary codex check`

Check which files need syncing (future: compare with remote).

**Usage:**
```bash
fractary codex check [options]
```

**Options:**
- `--pattern <glob>` - File pattern to match (default: "**/*.md")
- `--target <repo>` - Check against specific repository
- `--json` - Output as JSON

**Behavior (Initial):**
1. Scan for files with Codex metadata
2. Identify files with sync rules
3. Show which files would sync where
4. (Future: compare with actual remote state)

**Example:**
```bash
fractary codex check
fractary codex check --target api-gateway
```

**Output:**
```
Sync Status Check

Files ready to sync:
  docs/api-guide.md → api-gateway, core-services
  docs/security-policy.md → all repositories
  docs/database-schema.md → api-gateway, data-*

Files without sync rules:
  docs/draft-proposal.md (no codex_sync_include)
  docs/local-notes.md (no codex_sync_include)

Summary: 3 files ready to sync, 2 files without sync rules
```

## SDK Integration

### Core SDK Functions Used

```typescript
import {
  // Metadata parsing
  parseMetadata,
  hasFrontmatter,
  validateMetadata,
  extractRawFrontmatter,

  // Pattern matching
  matchPattern,
  matchAnyPattern,
  filterByPatterns,
  evaluatePatterns,

  // Configuration
  loadConfig,
  resolveOrganization,
  extractOrgFromRepoName,
  getDefaultConfig,

  // Routing
  shouldSyncToRepo,
  getTargetRepos,

  // Types
  type Metadata,
  type CodexConfig,
  type SyncRules
} from '@fractary/codex'
```

### Example Implementation

```typescript
// validate.ts
import { parseMetadata, validateMetadata } from '@fractary/codex'
import { readFile } from 'fs/promises'

export async function validateFile(filePath: string) {
  const content = await readFile(filePath, 'utf-8')

  const result = parseMetadata(content)

  if (!result.metadata) {
    console.error(`No frontmatter found in ${filePath}`)
    return false
  }

  const validation = validateMetadata(result.metadata)

  if (!validation.success) {
    console.error(`Validation failed for ${filePath}:`)
    validation.error.issues.forEach(issue => {
      console.error(`  - ${issue.message}`)
    })
    return false
  }

  console.log(`✓ ${filePath} - Valid`)
  return true
}
```

## Implementation Phases

### Phase 1: Core Commands (Priority)
**Estimated effort**: 2-3 days

Commands:
- `init` - Initialize project
- `validate` - Validate metadata
- `parse` - Parse and display metadata
- `config show` - Display configuration

Rationale: These provide immediate value for local development and debugging.

### Phase 2: Routing & Analysis
**Estimated effort**: 2-3 days

Commands:
- `route` - Show routing decisions
- `list` - List files with metadata
- `config get/set` - Edit configuration

Rationale: Helps developers understand and test routing rules.

### Phase 3: Status & Sync Preparation
**Estimated effort**: 2-3 days

Commands:
- `check` - Check sync status
- Enhanced error reporting
- Performance optimizations

Rationale: Prepares for future sync functionality.

### Phase 4: Future Enhancements
**Estimated effort**: TBD

Features:
- GitHub Actions integration
- Direct sync commands
- Watch mode for automatic validation
- Diff comparison with remote
- Interactive mode for fixing errors

## Configuration

### Configuration File Format

`.fractary/codex.config.json`:

```json
{
  "organizationSlug": "fractary",
  "directories": {
    "source": ".fractary",
    "target": ".fractary",
    "systems": ".fractary/systems"
  },
  "rules": {
    "preventSelfSync": true,
    "preventCodexSync": true,
    "allowProjectOverrides": true,
    "autoSyncPatterns": [
      {
        "pattern": "*/docs/schema/*.json",
        "include": ["*"],
        "exclude": []
      }
    ]
  }
}
```

### Environment Variables

Supported environment variables (from SDK):
- `ORGANIZATION_SLUG` - Organization identifier
- `CODEX_ORG_SLUG` - Alternative organization identifier
- `CODEX_SOURCE_DIR` - Source directory override
- `CODEX_TARGET_DIR` - Target directory override

## Use Cases

### Use Case 1: Starting a New Project

```bash
# Initialize Codex configuration
fractary codex init --org fractary

# Create documentation with frontmatter
# (Edit docs/api-guide.md)

# Validate metadata
fractary codex validate docs/api-guide.md

# Check where it will sync
fractary codex route docs/api-guide.md

# List all documented files
fractary codex list
```

### Use Case 2: Debugging Sync Issues

```bash
# Check configuration
fractary codex config show

# Validate all documentation
fractary codex validate docs/ --strict

# See routing for specific file
fractary codex route docs/problematic-file.md

# Parse metadata to see what's wrong
fractary codex parse docs/problematic-file.md
```

### Use Case 3: Bulk Validation

```bash
# Validate all markdown in repository
fractary codex validate --pattern "**/*.md"

# List files by system
fractary codex list --system api-gateway

# Check sync status for all files
fractary codex check
```

### Use Case 4: CI/CD Integration

```bash
# In CI pipeline
fractary codex validate --strict --json > validation-results.json

# Exit code 0 if all valid, non-zero otherwise
if [ $? -ne 0 ]; then
  echo "Codex metadata validation failed"
  exit 1
fi
```

## Error Handling

### Validation Errors

**Missing required fields:**
```
✗ docs/api-guide.md
  - Error: Missing required field 'org'
  - Error: Missing required field 'system'
```

**Invalid format:**
```
✗ docs/api-guide.md
  - Error: codex_sync_include must be an array
  - Error: visibility must be one of: public, internal, private
```

**Invalid patterns:**
```
✗ docs/api-guide.md
  - Error: Invalid glob pattern: '[invalid'
```

### Runtime Errors

**Configuration not found:**
```
Error: Codex configuration not found
Run 'fractary codex init' to create configuration
```

**Invalid configuration:**
```
Error: Invalid codex.config.json
  - organizationSlug is required
  - directories.source must be a string
```

**File not found:**
```
Error: File not found: docs/missing.md
```

## Testing Strategy

### Unit Tests
- Test each command with valid/invalid inputs
- Test SDK integration functions
- Test file scanning and filtering
- Test output formatting

### Integration Tests
- Test full command workflows
- Test configuration loading
- Test error handling paths
- Test CLI argument parsing

### Fixtures
```
tests/fixtures/codex/
├── valid-metadata.md
├── invalid-metadata.md
├── missing-frontmatter.md
├── malformed-yaml.md
└── config/
    ├── valid-config.json
    └── invalid-config.json
```

## Future Enhancements

### Phase 5: GitHub Integration

Commands:
- `fractary codex sync pull` - Pull docs from projects to Codex
- `fractary codex sync push` - Push docs from Codex to projects
- `fractary codex sync bidirectional` - Full bidirectional sync

Integration with existing GitHub Actions workflows.

### Phase 6: Watch Mode

```bash
fractary codex watch
```

Automatically validate files on change, show routing updates.

### Phase 7: Interactive Mode

```bash
fractary codex fix docs/api-guide.md
```

Interactive prompts to fix validation errors.

### Phase 8: Diff & Compare

```bash
fractary codex diff docs/api-guide.md --remote api-gateway
```

Compare local file with remote version, show sync status.

## Related Specifications

- **SPEC-0001**: Fractary CLI Overview (unified CLI architecture)
- **@fractary/codex SDK**: Core business logic (external)

## Success Criteria

1. ✅ All core commands implemented and working
2. ✅ Proper SDK integration with error handling
3. ✅ Clear, helpful output for all commands
4. ✅ Comprehensive test coverage (>80%)
5. ✅ Documentation complete with examples
6. ✅ CI/CD integration examples provided
7. ✅ Performance acceptable for large repositories (1000+ files)

## Open Questions

1. **Should we support multiple config file formats?** (JSON, YAML, TOML)
   - Recommendation: Start with JSON only, add YAML if requested

2. **Should we cache parsing results?**
   - Recommendation: Not in initial version, add if performance issues

3. **Should we support remote repository querying?**
   - Recommendation: Phase 5 feature, use GitHub API

4. **Should we bundle example templates?**
   - Recommendation: Yes, include in `init` command

5. **Should we support workspace/monorepo mode?**
   - Recommendation: Phase 6 feature, handle multiple `.fractary/` dirs

## References

- [@fractary/codex SDK](https://www.npmjs.com/package/@fractary/codex)
- [Codex Core SDK Specification](https://github.com/fractary/codex/tree/main/docs/specs)
- [forge-bundle-codex-github-core](https://github.com/fractary/forge-bundle-codex-github-core)
- [forge-bundle-codex-claude-agents](https://github.com/fractary/forge-bundle-codex-claude-agents)
