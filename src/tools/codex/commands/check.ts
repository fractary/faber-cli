/**
 * Check sync status command
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { parseMetadata, hasFrontmatter } from '@fractary/codex';
import { scanFiles, readFileContent } from '../utils/file-scanner';
import { formatJSON } from '../utils/output-formatter';
import * as path from 'path';

export function checkCommand(): Command {
  const cmd = new Command('check');

  cmd
    .description('Check which files need syncing')
    .option('--pattern <glob>', 'File pattern to match', '**/*.md')
    .option('--target <repo>', 'Check against specific repository')
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

        // Analyze files
        const readyToSync: Array<{ path: string; targets: string[] }> = [];
        const withoutRules: string[] = [];
        const noMetadata: string[] = [];

        for (const file of files) {
          const absPath = path.join(process.cwd(), file);

          try {
            const content = await readFileContent(absPath);

            if (!hasFrontmatter(content)) {
              noMetadata.push(file);
              continue;
            }

            const result = parseMetadata(content);
            if (!result.metadata) {
              noMetadata.push(file);
              continue;
            }

            // Check if has sync rules
            const includes = result.metadata.codex_sync_include || [];
            const excludes = result.metadata.codex_sync_exclude || [];

            if (includes.length === 0) {
              withoutRules.push(file);
              continue;
            }

            // Determine targets (simplified)
            const targets: string[] = [];
            if (includes.includes('*')) {
              targets.push('all repositories');
            } else {
              targets.push(...includes);
            }

            if (options.target) {
              // Check if matches target
              const matchesTarget = includes.some(pattern => {
                if (pattern === '*') return true;
                const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
                return regex.test(options.target);
              });

              const excludedFromTarget = excludes.some(pattern => {
                const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
                return regex.test(options.target);
              });

              if (matchesTarget && !excludedFromTarget) {
                readyToSync.push({ path: file, targets: [options.target] });
              }
            } else {
              readyToSync.push({ path: file, targets });
            }

          } catch (error) {
            // Skip files that can't be read
            continue;
          }
        }

        // Output results
        if (options.json) {
          const output = {
            readyToSync: readyToSync.map(f => ({
              file: f.path,
              targets: f.targets
            })),
            withoutRules: withoutRules,
            noMetadata: noMetadata,
            summary: {
              readyToSync: readyToSync.length,
              withoutRules: withoutRules.length,
              noMetadata: noMetadata.length
            }
          };
          console.log(formatJSON(output));
        } else {
          console.log(chalk.bold('Sync Status Check\n'));

          if (readyToSync.length > 0) {
            console.log(chalk.bold('Files ready to sync:'));
            for (const file of readyToSync) {
              console.log(chalk.green('  ✓'), chalk.cyan(file.path), chalk.dim(`→ ${file.targets.join(', ')}`));
            }
            console.log();
          }

          if (withoutRules.length > 0) {
            console.log(chalk.bold('Files without sync rules:'));
            for (const file of withoutRules) {
              console.log(chalk.yellow('  -'), chalk.dim(file), chalk.dim('(no codex_sync_include)'));
            }
            console.log();
          }

          if (noMetadata.length > 0) {
            console.log(chalk.bold('Files without Codex metadata:'));
            console.log(chalk.dim(`  ${noMetadata.length} file(s) without frontmatter`));
            console.log();
          }

          // Summary
          console.log(chalk.bold('Summary:'));
          console.log(`  ${chalk.green(readyToSync.length)} file${readyToSync.length !== 1 ? 's' : ''} ready to sync`);
          console.log(`  ${chalk.yellow(withoutRules.length)} file${withoutRules.length !== 1 ? 's' : ''} without sync rules`);
          console.log(`  ${chalk.dim(noMetadata.length)} file${noMetadata.length !== 1 ? 's' : ''} without metadata`);
        }

      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  return cmd;
}
