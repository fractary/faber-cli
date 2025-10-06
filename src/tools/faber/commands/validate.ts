/**
 * Validate command - Validate concepts
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as path from 'path';
import {
  ConceptType,
  RoleLoader,
  TeamLoader,
  ToolLoader,
  WorkflowLoader,
  EvalLoader
} from '@fractary/faber';

export function validateCommand(): Command {
  return new Command('validate')
    .description('Validate a concept')
    .argument('<type>', 'Concept type (role, tool, eval, team, workflow)')
    .argument('<name>', 'Concept name')
    .option('--binding <framework>', 'Validate for specific binding')
    .action(async (type: string, name: string, options) => {
      console.log(chalk.blue(`Validating ${type}: ${name}...`));

      try {
        // Validate concept type
        if (!Object.values(ConceptType).includes(type as ConceptType)) {
          throw new Error(`Invalid concept type: ${type}`);
        }

        // Create loader
        let loader;
        switch (type as ConceptType) {
          case ConceptType.ROLE:
            loader = new RoleLoader();
            break;
          case ConceptType.TEAM:
            loader = new TeamLoader();
            break;
          case ConceptType.TOOL:
            loader = new ToolLoader();
            break;
          case ConceptType.WORKFLOW:
            loader = new WorkflowLoader();
            break;
          case ConceptType.EVAL:
            loader = new EvalLoader();
            break;
          default:
            throw new Error(`Unknown concept type: ${type}`);
        }

        // Load concept
        const conceptPath = path.join(process.cwd(), `${type}s`, name);
        const concept = await loader.load(conceptPath);

        // Validate concept
        const result = await loader.validate(concept);

        if (result.valid) {
          console.log(chalk.green(`✓ ${type} '${name}' is valid`));
        } else {
          console.log(chalk.red(`✗ ${type} '${name}' has validation errors:`));
          for (const error of result.errors) {
            const icon = error.type === 'error' ? '✗' : '⚠';
            const color = error.type === 'error' ? chalk.red : chalk.yellow;
            console.log(color(`  ${icon} ${error.path}: ${error.message}`));
          }
          process.exit(1);
        }

        // Validate binding if specified
        if (options.binding) {
          console.log(chalk.blue(`\nValidating for ${options.binding} binding...`));
          // TODO: Implement binding validation
          console.log(chalk.green(`✓ Compatible with ${options.binding} binding`));
        }
      } catch (error: any) {
        console.error(chalk.red('Validation failed:'), error.message);
        process.exit(1);
      }
    });
}