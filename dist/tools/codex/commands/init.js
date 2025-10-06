"use strict";
/**
 * Initialize Codex project command
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCommand = initCommand;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const codex_1 = require("@fractary/codex");
const file_scanner_1 = require("../utils/file-scanner");
const path = __importStar(require("path"));
function initCommand() {
    const cmd = new commander_1.Command('init');
    cmd
        .description('Initialize a Codex project with configuration and directory structure')
        .option('--org <slug>', 'Organization slug (e.g., "fractary")')
        .option('--repo <name>', 'Repository name (e.g., "codex.fractary.com")')
        .option('--force', 'Overwrite existing configuration')
        .action(async (options) => {
        try {
            console.log(chalk_1.default.blue('Initializing Codex project...\n'));
            // Resolve organization
            let org = options.org;
            if (!org && options.repo) {
                org = (0, codex_1.extractOrgFromRepoName)(options.repo);
            }
            if (!org) {
                org = (0, codex_1.resolveOrganization)({
                    repoName: path.basename(process.cwd())
                });
            }
            if (!org) {
                console.error(chalk_1.default.red('Error: Could not determine organization slug.'));
                console.log(chalk_1.default.dim('Please provide either --org or --repo option.'));
                console.log(chalk_1.default.dim('Example: fractary codex init --org fractary'));
                process.exit(1);
            }
            console.log(chalk_1.default.dim(`Organization: ${chalk_1.default.cyan(org)}\n`));
            // Check if config already exists
            const configPath = path.join(process.cwd(), '.fractary', 'codex.config.json');
            const configExists = await (0, file_scanner_1.fileExists)(configPath);
            if (configExists && !options.force) {
                console.log(chalk_1.default.yellow('⚠ Configuration already exists at .fractary/codex.config.json'));
                console.log(chalk_1.default.dim('Use --force to overwrite'));
                process.exit(1);
            }
            // Create directory structure
            console.log('Creating directory structure...');
            const dirs = [
                '.fractary',
                '.fractary/systems',
                'docs'
            ];
            for (const dir of dirs) {
                await (0, file_scanner_1.ensureDirectory)(path.join(process.cwd(), dir));
                console.log(chalk_1.default.green('✓'), chalk_1.default.dim(dir + '/'));
            }
            // Create configuration file
            console.log('\nCreating configuration file...');
            const config = (0, codex_1.getDefaultConfig)(org);
            const configContent = JSON.stringify(config, null, 2);
            await (0, file_scanner_1.writeFileContent)(configPath, configContent);
            console.log(chalk_1.default.green('✓'), chalk_1.default.dim('.fractary/codex.config.json'));
            // Create README in .fractary
            const readmePath = path.join(process.cwd(), '.fractary', 'README.md');
            const readmeContent = `# Fractary Codex Configuration

This directory contains Codex configuration and system-specific content.

## Structure

- \`codex.config.json\` - Codex configuration
- \`systems/\` - System-specific content and overrides

## Learn More

- [Codex Documentation](https://docs.fractary.com/codex)
- [@fractary/codex SDK](https://www.npmjs.com/package/@fractary/codex)
`;
            await (0, file_scanner_1.writeFileContent)(readmePath, readmeContent);
            console.log(chalk_1.default.green('✓'), chalk_1.default.dim('.fractary/README.md'));
            // Create example documentation
            console.log('\nCreating example documentation...');
            const examplePath = path.join(process.cwd(), 'docs', 'example-guide.md');
            const exampleContent = `---
org: ${org}
system: example-system
title: Example Guide
description: Example documentation with Codex metadata
codex_sync_include: []
codex_sync_exclude: []
visibility: internal
tags: [guide, example]
created: "${new Date().toISOString().split('T')[0]}"
updated: "${new Date().toISOString().split('T')[0]}"
---

# Example Guide

This is an example documentation file with Codex frontmatter metadata.

## Codex Sync Rules

The frontmatter above controls how this file syncs across repositories:

- **codex_sync_include**: Array of patterns for repos that should receive this file
- **codex_sync_exclude**: Array of patterns for repos that should NOT receive this file

### Examples

Sync to all API-related projects:
\`\`\`yaml
codex_sync_include: ['api-*', 'core-*']
\`\`\`

Sync to all except test projects:
\`\`\`yaml
codex_sync_include: ['*']
codex_sync_exclude: ['*-test', '*-dev']
\`\`\`

## Learn More

- [Codex CLI Commands](https://docs.fractary.com/codex/cli)
- [Metadata Schema](https://docs.fractary.com/codex/metadata)
`;
            await (0, file_scanner_1.writeFileContent)(examplePath, exampleContent);
            console.log(chalk_1.default.green('✓'), chalk_1.default.dim('docs/example-guide.md'));
            // Success message
            console.log(chalk_1.default.green('\n✓ Codex project initialized successfully!\n'));
            console.log(chalk_1.default.bold('Next steps:'));
            console.log(chalk_1.default.dim('  1. Review configuration: .fractary/codex.config.json'));
            console.log(chalk_1.default.dim('  2. Edit example: docs/example-guide.md'));
            console.log(chalk_1.default.dim('  3. Validate metadata: fractary codex validate docs/'));
            console.log(chalk_1.default.dim('  4. Parse a file: fractary codex parse docs/example-guide.md'));
            console.log(chalk_1.default.dim('  5. Check routing: fractary codex route docs/example-guide.md'));
        }
        catch (error) {
            console.error(chalk_1.default.red('Error:'), error.message);
            process.exit(1);
        }
    });
    return cmd;
}
//# sourceMappingURL=init.js.map