#!/usr/bin/env node

/**
 * Simplified Faber CLI for initial release
 */

import { program } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs/promises';
import * as path from 'path';

const packageJson = require('../../package.json');

async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {}
}

async function writeFile(filePath: string, content: string) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
}

program
  .name('faber')
  .description('Universal AI agent orchestration platform')
  .version(packageJson.version);

// Init command
program
  .command('init')
  .description('Initialize a new Faber project')
  .action(async () => {
    try {
      console.log(chalk.blue('Initializing Faber project...'));

      const dirs = [
        '.faber/overlays/organization',
        '.faber/overlays/platforms',
        '.faber/overlays/roles',
        'roles',
        'tools',
        'teams',
        'workflows',
        'evals',
        'deployments'
      ];

      for (const dir of dirs) {
        await ensureDir(dir);
      }

      const config = {
        platforms: {},
        mcp_servers: {},
        overlays: {
          enabled: true,
          paths: ['.faber/overlays']
        }
      };

      await writeFile('.faber/config.yml', `# Faber-CLI Configuration\n\n${JSON.stringify(config, null, 2)}`);

      console.log(chalk.green('✓ Initialized Faber project'));
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Create command
program
  .command('create <type> <name>')
  .description('Create a new concept (role, tool, team, workflow, eval)')
  .option('--platforms <list>', 'Comma-separated platform list')
  .option('--description <desc>', 'Description')
  .action(async (type: string, name: string, options: any) => {
    try {
      const validTypes = ['role', 'tool', 'team', 'workflow', 'eval'];
      if (!validTypes.includes(type)) {
        throw new Error(`Invalid type: ${type}. Must be one of: ${validTypes.join(', ')}`);
      }

      console.log(chalk.blue(`Creating ${type}: ${name}`));

      const dir = path.join(`${type}s`, name);
      await ensureDir(dir);

      // Create basic metadata file
      const metadataFile = type === 'role' ? 'agent.yml' :
                          type === 'team' ? 'team.yml' :
                          type === 'workflow' ? 'workflow.yml' :
                          type === 'tool' ? 'tool.yml' :
                          'eval.yml';

      const metadata = `name: ${name}
description: ${options.description || `${type} ${name}`}
${type === 'role' && options.platforms ? `platforms:\n${options.platforms.split(',').map((p: string) => `  - ${p.trim()}`).join('\n')}` : ''}`;

      await writeFile(path.join(dir, metadataFile), metadata);

      // Create prompt.md for roles
      if (type === 'role') {
        await writeFile(
          path.join(dir, 'prompt.md'),
          `# ${name}\n\n${options.description || 'Role description'}\n\n## Core Behavior\n\n[Define agent behavior here]`
        );

        // Create subdirectories
        for (const subdir of ['tasks', 'flows', 'contexts']) {
          await ensureDir(path.join(dir, subdir));
        }
      }

      console.log(chalk.green(`✓ Created ${type}: ${name}`));
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// List command
program
  .command('list [type]')
  .description('List concepts')
  .action(async (type?: string) => {
    try {
      const types = type ? [type] : ['role', 'tool', 'team', 'workflow', 'eval'];

      for (const t of types) {
        const dir = `${t}s`;
        try {
          const items = await fs.readdir(dir);
          if (items.length > 0) {
            console.log(chalk.blue(`\n${t.charAt(0).toUpperCase() + t.slice(1)}s:`));
            for (const item of items) {
              console.log(`  - ${item}`);
            }
          }
        } catch (e) {
          // Directory doesn't exist yet
        }
      }
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Build command (simplified)
program
  .command('build <framework> <type> <name>')
  .description('Build a deployment for a framework')
  .option('--output <dir>', 'Output directory', './deployments')
  .action(async (framework: string, type: string, name: string, options: any) => {
    try {
      console.log(chalk.blue(`Building ${type} "${name}" for ${framework}...`));

      const sourcePath = path.join(`${type}s`, name);

      // Check if source exists
      try {
        await fs.access(sourcePath);
      } catch {
        throw new Error(`${type} "${name}" not found`);
      }

      // For now, just create a simple output structure
      const outputDir = path.join(options.output, framework);

      if (framework === 'claude' && type === 'role') {
        // Create Claude Code structure
        const agentPath = path.join(outputDir, '.claude', 'agents', name + '.md');
        await ensureDir(path.dirname(agentPath));

        // Read prompt if exists
        let prompt = `# ${name}\n\nAgent for Claude Code`;
        try {
          prompt = await fs.readFile(path.join(sourcePath, 'prompt.md'), 'utf-8');
        } catch {}

        await writeFile(agentPath, prompt);

        console.log(chalk.green(`✓ Built ${framework} deployment`));
        console.log(chalk.gray(`  Output: ${agentPath}`));
      } else {
        console.log(chalk.yellow(`Framework "${framework}" support coming soon`));
      }

    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Validate command
program
  .command('validate <type> <name>')
  .description('Validate a concept')
  .action(async (type: string, name: string) => {
    try {
      console.log(chalk.blue(`Validating ${type}: ${name}`));

      const dir = path.join(`${type}s`, name);

      // Check if exists
      try {
        await fs.access(dir);
        console.log(chalk.green(`✓ ${type} "${name}" exists`));

        // Check for required files
        const metadataFile = type === 'role' ? 'agent.yml' :
                            type === 'team' ? 'team.yml' :
                            type === 'workflow' ? 'workflow.yml' :
                            type === 'tool' ? 'tool.yml' :
                            'eval.yml';

        try {
          await fs.access(path.join(dir, metadataFile));
          console.log(chalk.green(`✓ Metadata file exists`));
        } catch {
          console.log(chalk.yellow(`⚠ Missing metadata file: ${metadataFile}`));
        }

        if (type === 'role') {
          try {
            await fs.access(path.join(dir, 'prompt.md'));
            console.log(chalk.green(`✓ Prompt file exists`));
          } catch {
            console.log(chalk.yellow(`⚠ Missing prompt.md`));
          }
        }

      } catch {
        console.log(chalk.red(`✗ ${type} "${name}" not found`));
        process.exit(1);
      }

    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Parse arguments
program.parse(process.argv);