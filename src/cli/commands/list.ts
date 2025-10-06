/**
 * List command - List concepts
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { ConceptType } from '@fractary/faber';

export function listCommand(): Command {
  return new Command('list')
    .description('List concepts in the project')
    .argument('[type]', 'Concept type to list (role, tool, eval, team, workflow)')
    .option('--verbose', 'Show detailed information')
    .action(async (type: string | undefined, options) => {
      try {
        if (type && !Object.values(ConceptType).includes(type as ConceptType)) {
          throw new Error(`Invalid concept type: ${type}`);
        }

        const types = type ? [type] : ['role', 'tool', 'eval', 'team', 'workflow'];

        for (const conceptType of types) {
          await listConceptType(conceptType, options.verbose);
        }
      } catch (error: any) {
        console.error(chalk.red('List failed:'), error.message);
        process.exit(1);
      }
    });
}

async function listConceptType(type: string, verbose: boolean): Promise<void> {
  const pluralType = `${type}s`;
  const dirPath = path.join(process.cwd(), pluralType);

  // Check if directory exists
  try {
    await fs.access(dirPath);
  } catch {
    if (verbose) {
      console.log(chalk.yellow(`No ${pluralType} found`));
    }
    return;
  }

  // List concepts
  const items = await fs.readdir(dirPath);
  const concepts: any[] = [];

  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stats = await fs.stat(itemPath);

    if (stats.isDirectory()) {
      // Try to load metadata
      const metadataFiles = ['agent.yml', 'tool.yml', 'eval.yml', 'team.yml', 'workflow.yml'];
      let metadata = null;

      for (const metadataFile of metadataFiles) {
        try {
          const metadataPath = path.join(itemPath, metadataFile);
          const content = await fs.readFile(metadataPath, 'utf-8');
          metadata = yaml.load(content);
          break;
        } catch {
          // Try next file
        }
      }

      if (metadata) {
        concepts.push({
          name: item,
          ...metadata
        });
      } else {
        concepts.push({
          name: item,
          description: 'No metadata found'
        });
      }
    }
  }

  if (concepts.length === 0) {
    if (verbose) {
      console.log(chalk.yellow(`No ${pluralType} found`));
    }
    return;
  }

  // Display concepts
  console.log(chalk.bold(`\n${chalk.blue(pluralType.charAt(0).toUpperCase() + pluralType.slice(1))}:`));

  for (const concept of concepts) {
    if (verbose) {
      console.log(`\n  ${chalk.green(concept.name)}`);
      console.log(`    Description: ${concept.description || 'N/A'}`);
      if (concept.org) console.log(`    Organization: ${concept.org}`);
      if (concept.system) console.log(`    System: ${concept.system}`);
      if (concept.platforms) console.log(`    Platforms: ${concept.platforms.join(', ')}`);
      if (concept.tags) console.log(`    Tags: ${concept.tags.join(', ')}`);
      if (concept.visibility) console.log(`    Visibility: ${concept.visibility}`);
    } else {
      const description = concept.description
        ? concept.description.split('\n')[0].substring(0, 50) + '...'
        : 'No description';
      console.log(`  ${chalk.green(concept.name.padEnd(25))} ${chalk.gray(description)}`);
    }
  }
}