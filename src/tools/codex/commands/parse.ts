/**
 * Parse Codex metadata command
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { parseMetadata, hasFrontmatter, extractRawFrontmatter } from '@fractary/codex';
import { readFileContent } from '../utils/file-scanner';
import { formatMetadata, formatContentPreview, formatJSON } from '../utils/output-formatter';
import * as path from 'path';

export function parseCommand(): Command {
  const cmd = new Command('parse');

  cmd
    .description('Parse and display frontmatter metadata from a file')
    .argument('<file>', 'Markdown file to parse')
    .option('--json', 'Output as JSON')
    .option('--yaml', 'Output as YAML')
    .option('--raw', 'Show raw frontmatter only')
    .option('--no-content', 'Hide content preview')
    .action(async (file: string, options) => {
      try {
        // Resolve absolute path
        const filePath = path.resolve(process.cwd(), file);

        // Read file content
        const content = await readFileContent(filePath);

        // Check if file has frontmatter
        if (!hasFrontmatter(content)) {
          console.log(chalk.yellow('⚠ No frontmatter found in file'));
          process.exit(1);
        }

        // Handle raw output
        if (options.raw) {
          const raw = extractRawFrontmatter(content);
          console.log(raw);
          return;
        }

        // Parse metadata
        const result = parseMetadata(content);

        if (!result.metadata) {
          console.error(chalk.red('Error: Failed to parse frontmatter'));
          process.exit(1);
        }

        // Handle JSON output
        if (options.json) {
          const output = {
            file: filePath,
            metadata: result.metadata,
            ...(options.content ? { content: result.content } : {})
          };
          console.log(formatJSON(output));
          return;
        }

        // Handle YAML output
        if (options.yaml) {
          const yaml = require('js-yaml');
          console.log(yaml.dump(result.metadata));
          return;
        }

        // Default formatted output
        console.log(chalk.bold(`File: ${chalk.cyan(path.relative(process.cwd(), filePath))}\n`));

        console.log(chalk.bold('Metadata:'));
        console.log(formatMetadata(result.metadata));

        // Content preview
        if (options.content && result.content) {
          console.log('\n' + chalk.bold('Content Preview:'));
          console.log(chalk.dim(formatContentPreview(result.content, 10)));
        }

      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  return cmd;
}
