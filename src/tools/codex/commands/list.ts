/**
 * List files with Codex metadata command
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { parseMetadata, hasFrontmatter } from '@fractary/codex';
import { scanFiles, readFileContent } from '../utils/file-scanner';
import { formatJSON } from '../utils/output-formatter';
import * as path from 'path';

export function listCommand(): Command {
  const cmd = new Command('list');

  cmd
    .description('List all files with Codex metadata')
    .option('--pattern <glob>', 'File pattern to match', '**/*.md')
    .option('--system <name>', 'Filter by system name')
    .option('--tag <name>', 'Filter by tag')
    .option('--visibility <level>', 'Filter by visibility (public, internal, private)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        // Scan for files
        const files = await scanFiles({
          pattern: options.pattern,
          cwd: process.cwd()
        });

        if (files.length === 0) {
          console.log(chalk.yellow('No files found'));
          process.exit(0);
        }

        // Parse and filter files
        const filesWithMetadata: Array<{
          path: string;
          metadata: any;
        }> = [];

        for (const file of files) {
          const absPath = path.join(process.cwd(), file);

          try {
            const content = await readFileContent(absPath);

            if (!hasFrontmatter(content)) {
              continue;
            }

            const result = parseMetadata(content);
            if (!result.metadata) {
              continue;
            }

            // Apply filters
            if (options.system && result.metadata.system !== options.system) {
              continue;
            }

            if (options.tag && (!result.metadata.tags || !result.metadata.tags.includes(options.tag))) {
              continue;
            }

            if (options.visibility && result.metadata.visibility !== options.visibility) {
              continue;
            }

            filesWithMetadata.push({
              path: file,
              metadata: result.metadata
            });
          } catch (error) {
            // Skip files that can't be read
            continue;
          }
        }

        // Output results
        if (options.json) {
          console.log(formatJSON(filesWithMetadata));
        } else {
          if (filesWithMetadata.length === 0) {
            console.log(chalk.yellow('No files found with Codex metadata matching filters'));
            process.exit(0);
          }

          console.log(chalk.bold('Files with Codex metadata:\n'));

          for (const file of filesWithMetadata) {
            console.log(chalk.cyan(file.path));

            const details: string[] = [];
            if (file.metadata.system) {
              details.push(`system: ${file.metadata.system}`);
            }
            if (file.metadata.tags && file.metadata.tags.length > 0) {
              details.push(`tags: ${file.metadata.tags.join(', ')}`);
            }
            if (file.metadata.visibility) {
              details.push(`visibility: ${file.metadata.visibility}`);
            }
            if (file.metadata.codex_sync_include && file.metadata.codex_sync_include.length > 0) {
              details.push(`syncs to: ${file.metadata.codex_sync_include.join(', ')}`);
            }

            if (details.length > 0) {
              console.log(chalk.dim('  ' + details.join('\n  ')));
            }
            console.log();
          }

          console.log(chalk.dim(`Found ${filesWithMetadata.length} file${filesWithMetadata.length !== 1 ? 's' : ''} with Codex metadata`));
        }

      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  return cmd;
}
