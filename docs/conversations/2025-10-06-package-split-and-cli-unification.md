# Conversation Summary: Package Split & CLI Unification
**Date**: October 6, 2025
**Session Duration**: Extended session
**Topics**: npm publishing, package architecture, CLI unification strategy

---

## Executive Summary

This session accomplished a major architectural transformation of the Faber project:

1. **Split monolithic package** into separate core SDK (`@fractary/faber`) and CLI (`@fractary/faber-cli`)
2. **Published core package** to npm registry
3. **Integrated CLI** to depend on published core package
4. **Planned unification** of all Fractary tool CLIs into single `@fractary/cli`

### Key Decisions Made

- ✅ Separate `@fractary/faber` (core SDK) from `@fractary/faber-cli` (CLI tool)
- ✅ Follow framework patterns (React, Vue, Angular) with separate core + CLI packages
- ✅ Create unified `@fractary/cli` for all Fractary tools (faber, forge, helm, codex, argus)
- ✅ Use command pattern: `fractary <tool> <command>` instead of tool-specific CLIs
- ✅ Unpublish `@fractary/faber-cli` and replace with `@fractary/cli`

---

## Part 1: Initial npm Publishing Setup

### Problem
User tried to install `@fractary/faber` but got 404 error - package didn't exist in npm registry.

### Actions Taken

1. **npm Organization Setup**
   - Configured npm account for publishing scoped packages
   - Set up 2FA authentication (encountered CLI issues, used web interface)
   - Configured organization membership for `@fractary` scope

2. **Publishing Configuration**
   - Fixed `.npmrc` issue (was publishing to GitHub Packages instead of npm)
   - Removed line: `@fractary:registry=https://npm.pkg.github.com`
   - Verified publishing to public npm registry

3. **TypeScript Build Fixes**
   - Installed missing type packages: `@types/node`, `@types/handlebars`
   - Updated `tsconfig.json` with `"types": ["node"]`
   - Fixed duplicate `Context` interface (removed duplicate, added import)
   - Added missing properties to interfaces (`metadata`, `path`, `type`)
   - Fixed `Role` interface structure with proper `RoleMetadata`

4. **First Publication**
   - Successfully published `@fractary/faber@0.1.0` to npm
   - Package included everything: core SDK + CLI in one

### Key Files Modified
- `tsconfig.json` - Added Node.js types
- `src/types/concepts.ts` - Fixed Context duplication, updated Role interface
- `src/types/contexts.ts` - Added metadata/path aliases
- `src/types/bindings.ts` - Added optional type field to ValidationError

---

## Part 2: Package Architecture Decision

### The Question
Should the package be named `@fractary/faber` or `@fractary/faber-cli`?

### Research & Analysis

**Examined Popular Framework Patterns:**

1. **Separate Packages (React, Vue, Angular, NestJS)**
   - Core package: `react`, `vue`, `@angular/core`, `@nestjs/core`
   - CLI package: `create-react-app`, `@vue/cli`, `@angular/cli`, `@nestjs/cli`
   - Pattern: Separate core SDK from CLI tools

2. **All-in-One (Next.js, Vite)**
   - Single package includes both programmatic API and CLI
   - Works when CLI is the primary interface

### Critical Realization
User recognized: "I think programmatic access will be important"

The Faber codebase includes:
- `FaberAPI` class for programmatic usage
- Core loaders, transformers, bindings for SDK consumption
- CLI is just one interface to the core functionality

### Decision Made
**Split into two packages following React/Angular pattern:**

- `@fractary/faber` - Core SDK/framework (no CLI)
- `@fractary/faber-cli` - CLI tool (depends on core)

### Architecture Choice
**Option B: Separate Repositories**
- `/mnt/c/GitHub/fractary/faber/` - Core SDK
- `/mnt/c/GitHub/fractary/faber-cli/` - CLI tool

Benefits:
- Clean separation of concerns
- Independent versioning
- SDK can be used without CLI overhead
- Follows established framework patterns

---

## Part 3: Package Extraction & Split

### Core Package Creation (`@fractary/faber`)

**Repository**: `/mnt/c/GitHub/fractary/faber/`

**Contents Moved**:
```
src/
├── api.ts                    # FaberAPI class
├── core/                     # Concept loaders, contexts, overlays
├── bindings/                 # Framework transformers
├── types/                    # TypeScript interfaces
└── utils/                    # Utilities
```

**Package Configuration**:
```json
{
  "name": "@fractary/faber",
  "version": "0.1.1",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./loaders": "./dist/core/concepts/index.js",
    "./bindings": "./dist/bindings/index.js"
  }
}
```

**Key Details**:
- No `bin` field (not a CLI)
- Exports configuration for SDK usage
- Published as `@fractary/faber@0.1.1`

### CLI Package Update (`@fractary/faber-cli`)

**Changes Made**:

1. **Renamed Package**
   - `@fractary/faber` → `@fractary/faber-cli`
   - Added dependency: `"@fractary/faber": "^0.1.0"`

2. **Removed Duplicate Files** (29 files deleted)
   - `src/api.ts`
   - `src/core/*`
   - `src/bindings/*`
   - `src/types/*`
   - `src/utils/*`
   - Total: 3,457 lines removed

3. **Updated Imports**
   - Changed from relative paths: `import { ... } from '../../types'`
   - To package imports: `import { ... } from '@fractary/faber'`

4. **Updated CLI Commands**
   - `src/cli/commands/build.ts` - Updated imports, replaced helper functions
   - `src/cli/commands/list.ts` - Updated ConceptType import
   - `src/cli/commands/validate.ts` - Updated imports, replaced createConceptLoader

5. **Helper Function Replacements**
   - Replaced `createConceptLoader()` with direct switch statements
   - Replaced `createBinding()` with direct instantiation
   - Example:
   ```typescript
   // OLD
   const loader = createConceptLoader(type);

   // NEW
   let loader;
   switch (type as ConceptType) {
     case ConceptType.ROLE:
       loader = new RoleLoader();
       break;
     // ...
   }
   ```

6. **Published**
   - Version: `0.1.1`
   - Successfully built and tested
   - Published to npm (later unpublished for unification)

### Git Commits Made

1. **Core Package Creation**
   - Initial extraction from faber-cli
   - Published `@fractary/faber@0.1.1`

2. **CLI Update** (commit: `038e9db`)
   ```
   Integrate with @fractary/faber core package

   - Updated all CLI command imports to use @fractary/faber
   - Removed duplicate core source files (moved to @fractary/faber)
   - Updated package-lock.json with @fractary/faber dependency
   - Replaced helper functions with direct loader instantiation
   - CLI successfully builds and runs with core package
   ```

3. **Version Bump** (commit: `9d3bc24`)
   ```
   0.1.1
   ```

---

## Part 4: CLI Unification Strategy

### The Vision

User explained Fractary has **multiple tools**:
- **faber** - AI agent orchestration
- **forge** - (CLI coming soon)
- **helm** - (CLI coming soon)
- **codex** - (CLI coming soon)
- **argus** - (CLI coming soon)

### Problems with Separate CLIs
1. **Installation overhead** - Users need to install multiple CLIs
2. **Naming conflicts** - Tool names conflict with existing packages
3. **Fragmented experience** - Different CLIs for related tools
4. **Maintenance burden** - Duplicate CLI logic across tools

### Solution: Unified `@fractary/cli`

**Command Pattern**: `fractary <tool> <command>`

**Examples**:
```bash
# Single installation
npm install -g @fractary/cli

# Use any Fractary tool
fractary faber init
fractary faber create role my-agent
fractary faber build claude role my-agent

fractary forge init
fractary codex search <query>
fractary helm deploy <env>
fractary argus monitor <service>
```

### Benefits

1. ✅ **Single installation** - One CLI for all Fractary tools
2. ✅ **No naming conflicts** - Main command is just `fractary`
3. ✅ **Easier maintenance** - Centralized CLI logic
4. ✅ **Better discoverability** - `fractary --help` shows all tools
5. ✅ **Lazy loading** - Only load tool commands when needed
6. ✅ **Unified updates** - Version all tools together
7. ✅ **Shared utilities** - Common code across tools

### Planned Architecture

```
fractary-cli/
├── package.json (name: @fractary/cli)
├── bin/
│   └── fractary.js
├── src/
│   ├── cli.ts                 # Main entry with tool routing
│   ├── tools/
│   │   ├── faber/            # Existing commands migrated here
│   │   │   ├── init.ts
│   │   │   ├── create.ts
│   │   │   ├── build.ts
│   │   │   ├── list.ts
│   │   │   └── validate.ts
│   │   ├── forge/            # Future
│   │   ├── helm/             # Future
│   │   ├── codex/            # Future
│   │   └── argus/            # Future
│   └── shared/               # Shared utilities
└── README.md
```

### Migration Plan

**Phase 1: Repository & Package Rename**
1. ✅ Unpublish `@fractary/faber-cli` (published < 1 hour ago, no users)
2. 🔄 Rename GitHub repo: `faber-cli` → `fractary-cli`
3. 🔄 Update package.json:
   - name: `@fractary/cli`
   - bin: `fractary` (not `faber`)
   - version: reset to `0.1.0`

**Phase 2: Restructure Source**
1. Create `src/tools/faber/` directory
2. Move `src/cli/commands/*.ts` → `src/tools/faber/`
3. Create main `src/cli.ts` with tool routing
4. Create `src/shared/` for common utilities

**Phase 3: Dependencies**
- Use regular dependencies (not peer/optional)
- Include `@fractary/faber` for faber commands
- Add `@fractary/forge`, etc. as they become available
- Simple approach: users get everything with one install

**Phase 4: Testing & Publication**
1. Test command routing
2. Verify faber commands work: `fractary faber init`
3. Update documentation
4. Publish `@fractary/cli@0.1.0`

### Status
- ✅ Strategy decided
- ✅ `@fractary/faber-cli` unpublished
- 🔄 **NEXT**: Rename repository (waiting for user)
- ⏸️ Directory rename will cause context loss
- 📝 This document preserves context

---

## Technical Details

### npm Dependencies: Regular vs Peer vs Optional

**Decision: Use Regular Dependencies**

After research, decided regular dependencies are best for CLI tools:

```json
{
  "dependencies": {
    "@fractary/faber": "^0.1.0",
    "@fractary/forge": "^0.1.0",  // when available
    "chalk": "^5.3.0",
    "commander": "^11.1.0"
  }
}
```

**Why not peer dependencies?**
- Peer deps are for plugins that need host compatibility
- CLI is not a plugin, it's a standalone tool
- Regular deps ensure everything installs automatically

**Why not optional dependencies?**
- Optional deps can fail to install without blocking
- We want guaranteed availability of all tool SDKs
- Simpler mental model for users

### WSL Development Notes

**Browser Opening Issues**:
- WSL can't automatically open Windows browsers
- Solutions tried:
  - Set `BROWSER` env variable
  - Use `wslview` utility
  - Manual URL copy/paste (chosen)

**Line Ending Issues**:
- CRLF vs LF issues with bash scripts
- Workaround: Run commands manually instead of via script

### Build Process

**Simple Build Script**:
```json
{
  "build:simple": "npx tsc src/cli/simple.ts --outDir dist --module commonjs --target ES2020 --esModuleInterop --resolveJsonModule --skipLibCheck && mv dist/simple.js dist/cli/simple.js 2>/dev/null || true"
}
```

**Hooks**:
- `prepare`: Runs on `npm install`
- `prepublishOnly`: Runs before `npm publish`

---

## Files & Locations

### Current Project Structure
```
/mnt/c/GitHub/fractary/faber-cli/    # Soon to be renamed: fractary-cli
├── .faber/
├── docs/
│   ├── conversations/
│   │   └── 2025-10-06-package-split-and-cli-unification.md  # This file
│   └── specs/                       # See CLAUDE.md for spec details
├── src/
│   └── cli/
│       ├── commands/
│       │   ├── build.ts            # Updated imports from @fractary/faber
│       │   ├── create.ts
│       │   ├── init.ts
│       │   ├── list.ts             # Updated imports from @fractary/faber
│       │   └── validate.ts         # Updated imports from @fractary/faber
│       ├── index.ts
│       └── simple.ts               # Main CLI entry point
├── CLAUDE.md                       # Project instructions for Claude
├── README.md                       # Will be updated for unified CLI
├── package.json                    # Currently @fractary/faber-cli@0.1.1
└── tsconfig.json
```

### Core SDK Repository
```
/mnt/c/GitHub/fractary/faber/
├── src/
│   ├── api.ts                      # FaberAPI class
│   ├── core/                       # Loaders, contexts, overlays
│   ├── bindings/                   # Framework transformers
│   ├── types/                      # TypeScript interfaces
│   └── utils/                      # Utilities
├── package.json                    # @fractary/faber@0.1.1
└── README.md
```

---

## Questions Answered

### Q: Should concepts support versioning?
**Status**: Not answered yet, deferred

### Q: Should contexts support includes/partials?
**Status**: Not answered yet, deferred

### Q: Should there be dependency visualization?
**Status**: Not answered yet, deferred

### Q: npm peer vs optional dependencies for CLI?
**Answer**: Use **regular dependencies** for simplicity and guaranteed availability

### Q: Keep `@fractary/faber-cli` for backward compatibility?
**Answer**: No, unpublish it (was published < 1 hour, no users affected)

### Q: New repo or rename existing for `fractary-cli`?
**Answer**: **Rename/repurpose** existing `faber-cli` repository

### Q: Other Fractary tools (forge, helm, codex, argus) exist?
**Answer**: No, CLIs coming soon. Core SDKs may be in development.

---

## Next Steps (After Directory Rename)

1. **Complete Repository Rename**
   - GitHub: `faber-cli` → `fractary-cli`
   - Local: Update git remote
   - Local: Rename directory (will lose context)

2. **Update package.json**
   - name: `@fractary/cli`
   - bin: `fractary`
   - description: Unified CLI
   - version: `0.1.0`

3. **Restructure Source Code**
   - Create `src/tools/faber/`
   - Move command files
   - Create main CLI router
   - Add tool detection/routing

4. **Update Documentation**
   - README.md with new command examples
   - Update all references from `faber` to `fractary faber`
   - Migration guide (if needed)

5. **Test & Publish**
   - Build and test locally
   - Test command routing
   - Publish `@fractary/cli@0.1.0`

---

## Key Learnings

1. **Framework patterns matter** - Following established patterns (React, Vue) makes architectural decisions clearer

2. **Programmatic access drives architecture** - If SDK usage is important, separate core from CLI

3. **Unified CLIs reduce friction** - Single installation > multiple tool-specific CLIs

4. **npm scoped packages** - Organization scopes (`@fractary/`) provide namespace control

5. **2FA challenges in WSL** - Browser opening issues, web interface more reliable

6. **TypeScript strict mode catches issues** - Missing type definitions surfaced structural problems

7. **Context preservation matters** - Document before major refactors that break conversation history

---

## Git History Reference

### Recent Commits (faber-cli)
```
9d3bc24 - 0.1.1
038e9db - Integrate with @fractary/faber core package
3d4fce9 - Update faber-cli to depend on @fractary/faber core package
8f6b551 - Rename package from @fractary/faber to @fractary/faber-cli
b49e0c8 - Add test artifacts to gitignore
```

### Branches
- `main` - Primary development branch
- Currently 2 commits ahead of origin (before final push)

---

## npm Packages Published

1. **@fractary/faber@0.1.1** ✅ Live on npm
   - Core SDK package
   - No CLI functionality
   - Provides loaders, bindings, types

2. **@fractary/faber-cli@0.1.1** ❌ Unpublished
   - Published briefly (~1 hour)
   - Unpublished for CLI unification
   - Being replaced by @fractary/cli

3. **@fractary/cli** 🔄 Planned
   - Unified CLI for all Fractary tools
   - Will replace faber-cli
   - Version 0.1.0 initial release

---

## Environment Details

- **Platform**: WSL2 (Linux on Windows)
- **Node.js**: >= 18.0.0
- **TypeScript**: 5.3.3
- **Package Manager**: npm
- **Git**: Using SSH keys (github-fractary)
- **2FA**: Enabled on npm account

---

## Important Context for Future Sessions

### This Project Will Be Renamed
- **Current**: `/mnt/c/GitHub/fractary/faber-cli`
- **Future**: `/mnt/c/GitHub/fractary/fractary-cli`
- **Impact**: All prior Claude Code conversation history will be lost

### Related Projects
- `/mnt/c/GitHub/fractary/faber/` - Core SDK (separate repo)
- Future: forge, helm, codex, argus (separate SDKs)

### Key Documents to Reference
- `CLAUDE.md` - Project instructions for Claude Code
- `docs/specs/` - Full specifications (see CLAUDE.md for index)
- This file - Conversation history and decisions

### Core Principles (from CLAUDE.md)
- Convention over configuration
- Separation of concerns
- Composability
- No-fork customization via overlays
- Platform-first via MCP
- Minimal deployments (intelligence in contexts)

---

## Success Metrics Achieved

✅ Published core SDK to npm
✅ Split monolithic package successfully
✅ Updated CLI to use published core
✅ Decided on unified CLI strategy
✅ Unpublished temporary package
✅ Documented all decisions and context
⏸️ Pending: Complete CLI unification

---

**End of Conversation Summary**
*Created to preserve context before directory rename*
