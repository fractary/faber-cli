/**
 * Faber tool - Universal AI agent orchestration
 *
 * Exports the faber command for the unified Fractary CLI
 */

import { Command } from 'commander';
import { initCommand } from './commands/init';
import { validateCommand } from './commands/validate';
import { buildCommand } from './commands/build';
import { listCommand } from './commands/list';
import { createCommand } from './commands/create';

/**
 * Create and configure the faber command
 */
export function createFaberCommand(): Command {
  const faber = new Command('faber');

  faber
    .description('Universal AI agent orchestration (write-once, deploy-everywhere)')
    .version('0.1.0');

  // Register commands
  faber.addCommand(initCommand());
  faber.addCommand(createCommand());
  faber.addCommand(listCommand());
  faber.addCommand(validateCommand());
  faber.addCommand(buildCommand());

  return faber;
}