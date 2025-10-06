/**
 * Initialize Codex project command
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { resolveOrganization, extractOrgFromRepoName, getDefaultConfig } from '@fractary/codex';
import { ensureDirectory, writeFileContent, fileExists } from '../utils/file-scanner';
import * as path from 'path';

export function initCommand(): Command {
  const cmd = new Command('init');

  cmd
    .description('Initialize a Codex project with configuration and directory structure')
    .option('--org <slug>', 'Organization slug (e.g., "fractary")')
    .option('--repo <name>', 'Repository name (e.g., "codex.fractary.com")')
    .option('--force', 'Overwrite existing configuration')
    .action(async (options) => {
      try {
        console.log(chalk.blue('Initializing Codex project...\n'));

        // Resolve organization
        let org = options.org;
        if (!org && options.repo) {
          org = extractOrgFromRepoName(options.repo);
        }
        if (!org) {
          org = resolveOrganization({
            repoName: path.basename(process.cwd())
          });
        }

        if (!org) {
          console.error(chalk.red('Error: Could not determine organization slug.'));
          console.log(chalk.dim('Please provide either --org or --repo option.'));
          console.log(chalk.dim('Example: fractary codex init --org fractary'));
          process.exit(1);
        }

        console.log(chalk.dim(`Organization: ${chalk.cyan(org)}\n`));

        // Check if config already exists
        const configPath = path.join(process.cwd(), '.fractary', 'codex.config.json');
        const configExists = await fileExists(configPath);

        if (configExists && !options.force) {
          console.log(chalk.yellow('⚠ Configuration already exists at .fractary/codex.config.json'));
          console.log(chalk.dim('Use --force to overwrite'));
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
          await ensureDirectory(path.join(process.cwd(), dir));
          console.log(chalk.green('✓'), chalk.dim(dir + '/'));
        }

        // Create configuration file
        console.log('\nCreating configuration file...');

        const config = getDefaultConfig(org);
        const configContent = JSON.stringify(config, null, 2);

        await writeFileContent(configPath, configContent);
        console.log(chalk.green('✓'), chalk.dim('.fractary/codex.config.json'));

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

        await writeFileContent(readmePath, readmeContent);
        console.log(chalk.green('✓'), chalk.dim('.fractary/README.md'));

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

        await writeFileContent(examplePath, exampleContent);
        console.log(chalk.green('✓'), chalk.dim('docs/example-guide.md'));

        // Success message
        console.log(chalk.green('\n✓ Codex project initialized successfully!\n'));

        console.log(chalk.bold('Next steps:'));
        console.log(chalk.dim('  1. Review configuration: .fractary/codex.config.json'));
        console.log(chalk.dim('  2. Edit example: docs/example-guide.md'));
        console.log(chalk.dim('  3. Validate metadata: fractary codex validate docs/'));
        console.log(chalk.dim('  4. Parse a file: fractary codex parse docs/example-guide.md'));
        console.log(chalk.dim('  5. Check routing: fractary codex route docs/example-guide.md'));

      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  return cmd;
}
