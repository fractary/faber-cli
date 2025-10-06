/**
 * Codex tool - Centralized knowledge management and distribution
 *
 * Exports the codex command for the unified Fractary CLI
 */

import { Command } from 'commander';
import { initCommand } from './commands/init';
import { validateCommand } from './commands/validate';
import { parseCommand } from './commands/parse';
import { configCommand } from './commands/config';
import { routeCommand } from './commands/route';
import { listCommand } from './commands/list';
import { checkCommand } from './commands/check';

/**
 * Create and configure the codex command
 */
export function createCodexCommand(): Command {
  const codex = new Command('codex');

  codex
    .description('Centralized knowledge management and distribution')
    .version('0.1.0');

  // Register commands
  codex.addCommand(initCommand());
  codex.addCommand(validateCommand());
  codex.addCommand(parseCommand());
  codex.addCommand(configCommand());
  codex.addCommand(routeCommand());
  codex.addCommand(listCommand());
  codex.addCommand(checkCommand());

  return codex;
}
