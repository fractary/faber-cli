# CLI Reference

Complete command reference for Faber-CLI.

## Global Options

All commands support these global options:

- `--help, -h` - Show help for command
- `--version, -v` - Show version number
- `--verbose` - Enable verbose output
- `--quiet` - Suppress non-error output

## Commands

### `faber init`

Initialize a new Faber project in the current directory.

```bash
faber init [options]
```

**Options:**
- `--template <name>` - Use a specific template (default: "default")

**Examples:**
```bash
# Basic initialization
faber init

# With a template
faber init --template enterprise
```

**Creates:**
- `.faber/config.yml` - Main configuration
- `.faber/overlays/` - Overlay directories
- `roles/`, `tools/`, `teams/`, `workflows/`, `evals/` - Concept directories
- `deployments/` - Build output directory

---

### `faber create`

Create a new concept (role, tool, eval, team, or workflow).

```bash
faber create <type> <name> [options]
```

**Arguments:**
- `type` - Concept type: `role`, `tool`, `eval`, `team`, `workflow`
- `name` - Unique name for the concept

**Options:**
- `--org <org>` - Organization namespace (default: "myorg")
- `--system <system>` - System namespace (default: "mysystem")
- `--platforms <list>` - Comma-separated platform list (for roles)
- `--type <tool-type>` - Tool type: `mcp-server`, `utility`, `api-client` (for tools)
- `--members <list>` - Comma-separated member roles (for teams)
- `--target <concept>` - Evaluation target like `role:agent-name` (for evals)

**Examples:**
```bash
# Create a role
faber create role issue-manager --platforms github-issues,linear

# Create an MCP server tool
faber create tool mcp-server-slack --type mcp-server

# Create a team
faber create team dev-squad --members backend-dev,frontend-dev,qa-engineer

# Create an evaluation
faber create eval security-audit --target role:security-scanner
```

---

### `faber list`

List concepts in the current project.

```bash
faber list [type] [options]
```

**Arguments:**
- `type` - Optional: `role`, `tool`, `eval`, `team`, `workflow` (lists all if omitted)

**Options:**
- `--verbose` - Show detailed information for each concept

**Examples:**
```bash
# List everything
faber list

# List only roles
faber list roles

# List roles with details
faber list roles --verbose
```

**Output Format:**
```
Roles:
  issue-manager            Manages issues across platforms...
  repo-manager             Handles repository operations...

Tools:
  mcp-server-github        GitHub MCP server integration...
```

---

### `faber validate`

Validate a concept for correctness and completeness.

```bash
faber validate <type> <name> [options]
```

**Arguments:**
- `type` - Concept type: `role`, `tool`, `eval`, `team`, `workflow`
- `name` - Name of the concept to validate

**Options:**
- `--binding <framework>` - Also validate for specific binding compatibility

**Examples:**
```bash
# Validate a role
faber validate role issue-manager

# Validate with binding check
faber validate role issue-manager --binding claude
```

**Output:**
- ✅ Success: Shows validation passed
- ❌ Errors: Lists specific validation errors
- ⚠️ Warnings: Shows non-critical issues

**Common Validation Checks:**
- Required files exist (metadata, prompt, etc.)
- Metadata schema is valid
- Referenced contexts exist
- Platform contexts match declared platforms
- Task/flow references are valid

---

### `faber build`

Build a deployment for a specific framework.

```bash
faber build <framework> <type> <name> [options]
```

**Arguments:**
- `framework` - Target framework: `claude`, `langgraph`, `crewai`
- `type` - Concept type: `role`, `tool`, `eval`, `team`, `workflow`
- `name` - Name of the concept to build

**Options:**
- `--output <path>` - Output directory (default: "./deployments")
- `--no-overlays` - Disable overlay application
- `--platform <name>` - Override platform selection
- `--dry-run` - Show what would be built without writing files

**Examples:**
```bash
# Build for Claude Code
faber build claude role issue-manager

# Build without overlays
faber build claude role issue-manager --no-overlays

# Custom output directory
faber build claude role issue-manager --output ./build

# Dry run to preview
faber build claude role issue-manager --dry-run
```

**Output Structure (Claude):**
```
deployments/claude/
├── .claude/
│   └── agents/{org}/{system}/{name}.md
├── docs/agents/{org}/{system}/{name}/
│   ├── contexts/
│   ├── tasks/
│   └── flows/
└── .faber/
    └── config.yml
```

---

### `faber deploy` *(Not Yet Implemented)*

Deploy a built concept to a target location.

```bash
faber deploy <type> <name> <framework> [options]
```

**Options:**
- `--target <path>` - Deployment target directory
- `--remote <url>` - Deploy to remote repository
- `--force` - Overwrite existing files

---

### `faber config` *(Not Yet Implemented)*

Manage project configuration.

```bash
faber config <action> [key] [value]
```

**Actions:**
- `get <key>` - Get configuration value
- `set <key> <value>` - Set configuration value
- `list` - Show all configuration
- `validate` - Validate configuration

**Examples:**
```bash
# Set platform for a role
faber config set platforms.issue-manager linear

# Get current platform
faber config get platforms.issue-manager

# List all config
faber config list
```

---

### `faber overlay` *(Not Yet Implemented)*

Manage overlay customizations.

```bash
faber overlay <action> [options]
```

**Subcommands:**

#### `faber overlay init`
Initialize overlay structure.

#### `faber overlay create`
Create a new overlay.

```bash
faber overlay create <type> [name]
```

Types: `organization`, `platform`, `role`, `team`, `workflow`

#### `faber overlay list`
List all overlays.

#### `faber overlay diff`
Show differences between base and overlaid version.

```bash
faber overlay diff <type> <name>
```

---

### `faber status` *(Not Yet Implemented)*

Show project status and information.

```bash
faber status [type] [options]
```

**Options:**
- `--framework <name>` - Check status for specific framework

**Shows:**
- Concept counts
- Validation status
- Build status
- Platform configurations
- Active overlays

---

## Environment Variables

Faber-CLI respects these environment variables:

- `FABER_HOME` - Override default Faber home directory
- `FABER_CONFIG` - Path to configuration file
- `FABER_DEBUG` - Enable debug output
- `NO_COLOR` - Disable colored output

## Configuration File

The `.faber/config.yml` file controls project behavior:

```yaml
# Platform mappings
platforms:
  role-name: platform-name

# MCP server configurations
mcp_servers:
  server-name:
    command: npx
    args: [-y, @modelcontextprotocol/server-name]
    env:
      API_KEY: ${ENV_VAR}

# Overlay settings
overlays:
  enabled: true
  paths:
    - .faber/overlays
    - ./custom-overlays

# Binding preferences
bindings:
  claude:
    auto_activate: true
  langgraph:
    python_version: "3.10"
```

## Exit Codes

- `0` - Success
- `1` - General error
- `2` - Validation error
- `3` - Build error
- `4` - Configuration error
- `5` - File not found

## Examples

### Complete Workflow Example

```bash
# 1. Initialize project
faber init

# 2. Create a role
faber create role code-reviewer --platforms github,gitlab

# 3. Validate it
faber validate role code-reviewer

# 4. Build for Claude
faber build claude role code-reviewer

# 5. Check what was created
ls -la deployments/claude/
```

### Multi-Platform Example

```bash
# Configure platforms in .faber/config.yml
cat > .faber/config.yml << EOF
platforms:
  issue-manager: linear
  repo-manager: github
  ci-manager: github-actions
EOF

# Build with platform-specific contexts
faber build claude role issue-manager
```

### Overlay Example

```bash
# Create organization overlay
mkdir -p .faber/overlays/organization/contexts/standards
echo "# Company Standards" > .faber/overlays/organization/contexts/standards/policy.md

# Build with overlays (default)
faber build claude role issue-manager

# Build without overlays
faber build claude role issue-manager --no-overlays
```

## Troubleshooting

### Common Issues

**"Command not found"**
- Ensure global installation: `npm install -g @fractary/faber`
- Or use npx: `npx @fractary/faber <command>`

**"Validation failed"**
- Check required files exist
- Verify metadata schema
- Ensure platform contexts exist for declared platforms

**"Build failed"**
- Run validation first
- Check binding compatibility
- Ensure all referenced contexts exist

**"No such concept"**
- Check spelling of concept name
- Verify concept directory exists
- Run `faber list` to see available concepts

## Getting Help

```bash
# General help
faber --help

# Command-specific help
faber build --help

# Version information
faber --version
```

## See Also

- [Getting Started](getting-started.md) - Quick start guide
- [Core Concepts](concepts.md) - Understanding the architecture
- [Examples](examples.md) - Real-world use cases
- [API Reference](api.md) - Programmatic usage