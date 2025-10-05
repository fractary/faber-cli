#!/usr/bin/env node

/**
 * Faber-CLI main entry point
 */

import { program } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init';
import { validateCommand } from './commands/validate';
import { buildCommand } from './commands/build';
import { listCommand } from './commands/list';
import { createCommand } from './commands/create';

// Package information
const packageJson = require('../../package.json');

// Configure program
program
  .name('faber')
  .description('Universal AI agent orchestration platform')
  .version(packageJson.version);

// Register commands
program.addCommand(initCommand());
program.addCommand(createCommand());
program.addCommand(listCommand());
program.addCommand(validateCommand());
program.addCommand(buildCommand());

// Error handling
program.exitOverride();

async function main() {
  try {
    await program.parseAsync(process.argv);
  } catch (error: any) {
    if (error.code === 'commander.help') {
      process.exit(0);
    }

    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

// Run CLI
main().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});