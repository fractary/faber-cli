/**
 * Codex configuration management command
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig, CodexConfigSchema } from '@fractary/codex';
import { fileExists, readFileContent, writeFileContent } from '../utils/file-scanner';
import { formatJSON } from '../utils/output-formatter';
import * as path from 'path';

export function configCommand(): Command {
  const cmd = new Command('config');

  cmd
    .description('View or edit Codex configuration')
    .argument('<action>', 'Action to perform: show, get, set, validate')
    .argument('[key]', 'Config key (for get/set actions)')
    .argument('[value]', 'Config value (for set action)')
    .option('--json', 'Output as JSON')
    .action(async (action: string, key: string | undefined, value: string | undefined, options) => {
      try {
        const configPath = path.join(process.cwd(), '.fractary', 'codex.config.json');

        switch (action) {
          case 'show':
            await showConfig(configPath, options.json);
            break;

          case 'get':
            if (!key) {
              console.error(chalk.red('Error: Key is required for get action'));
              console.log(chalk.dim('Example: fractary codex config get organizationSlug'));
              process.exit(1);
            }
            await getConfigValue(configPath, key, options.json);
            break;

          case 'set':
            if (!key || !value) {
              console.error(chalk.red('Error: Key and value are required for set action'));
              console.log(chalk.dim('Example: fractary codex config set organizationSlug fractary'));
              process.exit(1);
            }
            await setConfigValue(configPath, key, value);
            break;

          case 'validate':
            await validateConfig(configPath);
            break;

          default:
            console.error(chalk.red(`Error: Unknown action: ${action}`));
            console.log(chalk.dim('Valid actions: show, get, set, validate'));
            process.exit(1);
        }

      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  return cmd;
}

/**
 * Show configuration
 */
async function showConfig(configPath: string, asJson: boolean): Promise<void> {
  const exists = await fileExists(configPath);

  if (!exists) {
    console.error(chalk.red('Error: Configuration not found'));
    console.log(chalk.dim('Run "fractary codex init" to create configuration'));
    process.exit(1);
  }

  const content = await readFileContent(configPath);
  const config = JSON.parse(content);

  if (asJson) {
    console.log(formatJSON(config));
    return;
  }

  console.log(chalk.bold('Codex Configuration\n'));

  console.log(chalk.bold('Organization:'));
  console.log(`  slug: ${chalk.cyan(config.organizationSlug || 'not set')}\n`);

  console.log(chalk.bold('Directories:'));
  console.log(`  source: ${chalk.dim(config.directories?.source || '.fractary')}`);
  console.log(`  target: ${chalk.dim(config.directories?.target || '.fractary')}`);
  console.log(`  systems: ${chalk.dim(config.directories?.systems || '.fractary/systems')}\n`);

  console.log(chalk.bold('Rules:'));
  console.log(`  preventSelfSync: ${config.rules?.preventSelfSync !== false ? chalk.green('true') : chalk.red('false')}`);
  console.log(`  preventCodexSync: ${config.rules?.preventCodexSync !== false ? chalk.green('true') : chalk.red('false')}`);
  console.log(`  allowProjectOverrides: ${config.rules?.allowProjectOverrides !== false ? chalk.green('true') : chalk.red('false')}`);

  if (config.rules?.autoSyncPatterns && config.rules.autoSyncPatterns.length > 0) {
    console.log(`  autoSyncPatterns: ${config.rules.autoSyncPatterns.length} pattern(s)\n`);
  } else {
    console.log(`  autoSyncPatterns: ${chalk.dim('none')}\n`);
  }

  console.log(chalk.dim(`Source: ${path.relative(process.cwd(), configPath)}`));
}

/**
 * Get config value
 */
async function getConfigValue(configPath: string, key: string, asJson: boolean): Promise<void> {
  const exists = await fileExists(configPath);

  if (!exists) {
    console.error(chalk.red('Error: Configuration not found'));
    process.exit(1);
  }

  const content = await readFileContent(configPath);
  const config = JSON.parse(content);

  // Support dot notation (e.g., "rules.preventSelfSync")
  const keys = key.split('.');
  let value: any = config;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.error(chalk.red(`Error: Key not found: ${key}`));
      process.exit(1);
    }
  }

  if (asJson) {
    console.log(formatJSON({ [key]: value }));
  } else {
    console.log(value);
  }
}

/**
 * Set config value
 */
async function setConfigValue(configPath: string, key: string, value: string): Promise<void> {
  const exists = await fileExists(configPath);

  if (!exists) {
    console.error(chalk.red('Error: Configuration not found'));
    process.exit(1);
  }

  const content = await readFileContent(configPath);
  const config = JSON.parse(content);

  // Support dot notation
  const keys = key.split('.');
  const lastKey = keys.pop()!;

  let target: any = config;
  for (const k of keys) {
    if (!target[k]) {
      target[k] = {};
    }
    target = target[k];
  }

  // Try to parse value as JSON (for objects, arrays, booleans, numbers)
  let parsedValue: any = value;
  try {
    parsedValue = JSON.parse(value);
  } catch {
    // Keep as string
  }

  target[lastKey] = parsedValue;

  // Write back
  await writeFileContent(configPath, JSON.stringify(config, null, 2));

  console.log(chalk.green('✓'), `Set ${chalk.cyan(key)} = ${parsedValue}`);
}

/**
 * Validate configuration
 */
async function validateConfig(configPath: string): Promise<void> {
  const exists = await fileExists(configPath);

  if (!exists) {
    console.error(chalk.red('Error: Configuration not found'));
    process.exit(1);
  }

  const content = await readFileContent(configPath);
  let config: any;

  try {
    config = JSON.parse(content);
  } catch (error: any) {
    console.error(chalk.red('✗ Invalid JSON:'), error.message);
    process.exit(1);
  }

  // Validate against schema
  const validation = CodexConfigSchema.safeParse(config);

  if (!validation.success) {
    console.log(chalk.red('✗ Configuration validation failed:\n'));

    for (const issue of validation.error.issues) {
      const path = issue.path.join('.');
      console.log(chalk.red('  -'), `${path}: ${issue.message}`);
    }

    process.exit(1);
  }

  console.log(chalk.green('✓'), 'Configuration is valid');
}
