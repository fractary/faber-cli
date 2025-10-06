# Codex CLI Implementation - October 6, 2025

## Session Context

This session implemented Codex CLI integration for the unified Fractary CLI, following the repository renaming from `@fractary/faber-cli` to `@fractary/cli`.

**Previous session**: [Package Split and CLI Unification](./2025-10-06-package-split-and-cli-unification.md)

## User Request

> "The @fractary/codex npm package with the codex core sdk has been created and published to npm and installed. Can you update the cli to support the 'fractary codex' commands."

User directed review of:
- `/forge-bundle-codex-github-core/` - GitHub Actions workflows for codex sync
- `/forge-bundle-codex-claude-agents/` - Claude Code agents for codex management

## Specification Creation

User requested: "Can you add this plan to a /docs/spec/SPEC-00xx-???.md spec file so we can record the requirements before implementing"

Created: [SPEC-0013: Codex CLI Integration](../specs/SPEC-0013-codex-cli-integration.md)

### Commands Specified

1. **init** - Initialize Codex project
2. **validate** - Validate frontmatter metadata
3. **parse** - Parse and display metadata
4. **config** - Manage configuration
5. **route** - Show routing decisions
6. **list** - List files with metadata
7. **check** - Check sync status

## Implementation Process

### Phase 1: Project Setup

**Dependencies Added:**
```json
{
  "@fractary/codex": "^0.1.0",
  "glob": "^10.3.10"
}
```

**Directory Structure Created:**
```
src/tools/codex/
├── commands/
│   ├── init.ts
│   ├── validate.ts
│   ├── parse.ts
│   ├── config.ts
│   ├── route.ts
│   ├── list.ts
│   └── check.ts
├── utils/
│   ├── file-scanner.ts
│   ├── output-formatter.ts
│   └── validation-reporter.ts
└── index.ts
```

### Phase 2: Utility Implementation

**file-scanner.ts** - File system operations:
- `scanFiles()` - Glob-based file scanning
- `fileExists()`, `readFileContent()`, `writeFileContent()`
- `ensureDirectory()` - Recursive directory creation

**output-formatter.ts** - Terminal formatting:
- `formatMetadata()` - Pretty-print metadata with colors
- `formatValidationResult()` - Validation output
- `formatRoutingDecision()` - Routing analysis display
- `formatJSON()`, `formatYAML()`, `formatRaw()` - Output formats

**validation-reporter.ts** - Validation tracking:
- `ValidationReporter` class - Collects validation results
- File-level error/warning tracking
- Summary reporting

### Phase 3: Command Implementation

#### 1. init.ts - Initialize Codex Project

Creates directory structure:
```
.fractary/
  codex.config.json
  systems/
    <system-name>/
      README.md
docs/
  example-guide.md
```

Generates configuration:
```json
{
  "org": "my-org",
  "systems": {
    "my-system": {
      "name": "my-system",
      "description": "My system",
      "repositories": ["my-repo"]
    }
  },
  "rules": {
    "preventSelfSync": true,
    "requireMetadata": true
  }
}
```

**Issue Encountered**: Date fields were Date objects instead of strings
**Fix**: Changed to quoted string literals:
```typescript
created: "${new Date().toISOString().split('T')[0]}"
updated: "${new Date().toISOString().split('T')[0]}"
```

#### 2. validate.ts - Validate Frontmatter Metadata

Validates YAML frontmatter in markdown files:
```bash
fractary codex validate docs/
fractary codex validate docs/ --format json
```

Uses SDK's `parseMetadata()` and `validateMetadata()` functions.

**Issue Encountered**: TypeScript error - assumed SDK returned `{success, error}` but it returns `{valid, errors}`
**Fix**: Updated validation check:
```typescript
// Before:
if (!validation.success) {
  for (const issue of validation.error.issues) {

// After:
if (!validation.valid && validation.errors) {
  for (const error of validation.errors) {
```

#### 3. parse.ts - Parse and Display Metadata

Extracts and displays metadata from a single file:
```bash
fractary codex parse docs/api-guide.md
fractary codex parse docs/api-guide.md --json
fractary codex parse docs/api-guide.md --yaml
```

Supports three output formats:
- Default: Pretty-printed with colors
- `--json`: JSON format
- `--yaml`: YAML format
- `--raw`: Raw frontmatter text

#### 4. config.ts - Configuration Management

Four actions: show, get, set, validate

```bash
# View entire config
fractary codex config show

# Get specific value (dot notation)
fractary codex config get rules.preventSelfSync

# Set value (auto-detects type)
fractary codex config set rules.preventSelfSync false

# Validate config
fractary codex config validate
```

Supports JSON parsing for complex values:
```bash
fractary codex config set systems.new '{"name":"new","repositories":["repo1"]}'
```

#### 5. route.ts - Show Routing Decisions

Analyzes which repositories a file will sync to:
```bash
fractary codex route docs/api-guide.md
fractary codex route docs/api-guide.md --repo target-repo
```

Uses SDK's `shouldSyncToRepo()` with pattern matching:
- `codex_sync_include`: Whitelist patterns
- `codex_sync_exclude`: Blacklist patterns
- Supports wildcards: `api-*`, `*-test`, etc.

#### 6. list.ts - List Files with Metadata

Lists all files with Codex metadata:
```bash
fractary codex list
fractary codex list --system api
fractary codex list --tag guide
fractary codex list --visibility internal
```

Filters:
- `--system <name>` - Filter by system
- `--tag <tag>` - Filter by tag
- `--visibility <level>` - Filter by visibility (public/internal/private)

#### 7. check.ts - Check Sync Status

Categorizes files by sync status:
```bash
fractary codex check
fractary codex check --format json
```

Three categories:
1. **Ready to sync** - Has metadata and sync rules
2. **No sync rules** - Has metadata but no include/exclude
3. **No metadata** - Markdown files without frontmatter

### Phase 4: CLI Integration

**src/tools/codex/index.ts**:
```typescript
export function createCodexCommand(): Command {
  const codex = new Command('codex');
  codex
    .description('Centralized knowledge management and distribution')
    .version('0.1.0');

  codex.addCommand(initCommand());
  codex.addCommand(validateCommand());
  codex.addCommand(parseCommand());
  codex.addCommand(configCommand());
  codex.addCommand(routeCommand());
  codex.addCommand(listCommand());
  codex.addCommand(checkCommand());

  return codex;
}
```

**src/cli.ts** - Added codex to main CLI:
```typescript
import { createCodexCommand } from './tools/codex';

program.addCommand(createFaberCommand());
program.addCommand(createCodexCommand());
```

Updated error messages to include codex in tool list.

### Phase 5: Testing

Tested in `/tmp/test-codex`:
```bash
cd /tmp/test-codex
fractary codex init --org fractary --system example-system
fractary codex validate docs/
fractary codex parse docs/example-guide.md
fractary codex config show
fractary codex route docs/example-guide.md
fractary codex list
fractary codex check
```

All commands verified working.

### Phase 6: Documentation Updates

**README.md**:
- Added Codex section with command examples
- Updated tools list (Codex no longer "coming soon")
- Updated implementation status sections

**CLAUDE.md**:
- Updated tools list to include Codex
- Added command pattern examples
- Added SDK information for @fractary/codex

**docs/specs/INDEX.md**:
- Added SPEC-0013 to unified CLI specs

### Phase 7: Version and Release

**Version bump**: 0.1.0 → 0.1.1

**Commit message**:
```
Implement Codex CLI integration

Add comprehensive Codex CLI support to unified Fractary CLI.

Changes:
- Add @fractary/codex SDK dependency
- Implement 7 Codex commands (init, validate, parse, config, route, list, check)
- Create utilities for file scanning, formatting, validation
- Integrate with main CLI structure
- Add SPEC-0013 documentation
- Update README and project docs

Commands implemented:
- fractary codex init - Initialize Codex project
- fractary codex validate - Validate frontmatter metadata
- fractary codex parse - Parse and display metadata
- fractary codex config - Manage configuration (show/get/set/validate)
- fractary codex route - Show routing decisions
- fractary codex list - List files with metadata (filterable)
- fractary codex check - Check sync status

Fixes:
- Date formatting in YAML frontmatter (must be quoted strings)
- SDK validation result shape (valid/errors, not success/error)

Version: 0.1.1
```

## Repository Rename Preparation

User request: "please proceed with the updates you need to make to the code before I change the actual repo name and project directory"

### Updates Completed

1. **package.json** - Updated repository URLs:
   - `fractary-cli` → `cli` in repository.url, bugs.url, homepage

2. **README.md** - Updated repository references:
   - Clone URL: `https://github.com/fractary/cli.git`
   - Directory: `cd cli`
   - Issues: `https://github.com/fractary/cli/issues`
   - Discussions: `https://github.com/fractary/cli/discussions`

## Technical Patterns

### SDK Integration Pattern

```typescript
// Import SDK functions
import {
  parseMetadata,
  validateMetadata,
  shouldSyncToRepo
} from '@fractary/codex';

// Use in command handlers
const result = parseMetadata(content);
if (!result.metadata) {
  console.error('No metadata found');
  process.exit(1);
}

const validation = validateMetadata(result.metadata);
if (!validation.valid) {
  // Handle errors
}
```

### File Scanning Pattern

```typescript
// Use glob for pattern matching
import { glob } from 'glob';

const files = await glob(pattern, {
  cwd: process.cwd(),
  ignore: ['node_modules/**', 'dist/**', '.git/**'],
  absolute: false,
  nodir: true
});
```

### Output Formatting Pattern

```typescript
// Use chalk for terminal colors
import chalk from 'chalk';

console.log(chalk.cyan('Label:'), chalk.white(value));
console.log(chalk.green('✓ Success'));
console.log(chalk.red('✗ Error'));
console.log(chalk.yellow('⚠ Warning'));
```

### Configuration Management Pattern

```typescript
// Read config
const configPath = path.join(process.cwd(), '.fractary', 'codex.config.json');
const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));

// Dot notation access
const keys = 'rules.preventSelfSync'.split('.');
let value: any = config;
for (const k of keys) {
  value = value[k];
}

// Write config
await fs.writeFile(configPath, JSON.stringify(config, null, 2));
```

## Lessons Learned

### 1. SDK Type Validation

Always check SDK return types carefully. Don't assume Zod-style `{success, error}` - check actual exports.

### 2. YAML Date Formatting

Dates in YAML must be quoted strings when generating programmatically:
```typescript
// Wrong: created: ${date}  (becomes Date object)
// Right: created: "${date}"  (stays string)
```

### 3. Pattern Matching with Glob

Glob is powerful for file scanning but requires careful ignore patterns:
- Always ignore: `node_modules/**`, `dist/**`, `.git/**`
- Use `nodir: true` to skip directories
- Use `absolute: false` for relative paths

### 4. CLI Command Organization

Modular command pattern works well:
- Each command in separate file
- Utility functions in shared utils/
- Main command builder in index.ts
- Keeps CLI responsive and maintainable

## Next Steps (Future Work)

### GitHub Actions Integration
- Sync command to push to target repositories
- Watch mode for automatic syncing
- GitHub API integration

### Advanced Routing
- Conditional routing based on metadata
- Multi-organization support
- System-level routing overrides

### Validation Enhancements
- Custom validation rules
- Schema extensions
- Validation hooks

## Related Files

### Created
- `docs/specs/SPEC-0013-codex-cli-integration.md`
- `src/tools/codex/index.ts`
- `src/tools/codex/commands/init.ts`
- `src/tools/codex/commands/validate.ts`
- `src/tools/codex/commands/parse.ts`
- `src/tools/codex/commands/config.ts`
- `src/tools/codex/commands/route.ts`
- `src/tools/codex/commands/list.ts`
- `src/tools/codex/commands/check.ts`
- `src/tools/codex/utils/file-scanner.ts`
- `src/tools/codex/utils/output-formatter.ts`
- `src/tools/codex/utils/validation-reporter.ts`

### Modified
- `package.json` - Added dependencies, bumped version, updated repo URLs
- `src/cli.ts` - Added createCodexCommand()
- `README.md` - Added Codex docs, updated repo URLs
- `CLAUDE.md` - Added Codex info
- `docs/specs/INDEX.md` - Added SPEC-0013

## Summary

Successfully implemented complete Codex CLI integration with 7 commands, comprehensive utilities, and full documentation. All commands tested and verified working. Repository prepared for rename from `fractary-cli` to `cli`.

**Commands ready for use:**
```bash
fractary codex init --org <org> --system <system>
fractary codex validate <path> [--format json]
fractary codex parse <file> [--json|--yaml|--raw]
fractary codex config <show|get|set|validate> [args]
fractary codex route <file> [--repo <name>]
fractary codex list [--system|--tag|--visibility]
fractary codex check [--format json]
```

---

*Prepared for repository rename: fractary-cli → cli*
