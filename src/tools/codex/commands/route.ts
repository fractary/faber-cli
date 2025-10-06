/**
 * Show routing decisions for a file command
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { parseMetadata, shouldSyncToRepo, loadConfig, hasFrontmatter } from '@fractary/codex';
import { readFileContent } from '../utils/file-scanner';
import { formatRoutingDecision, formatJSON } from '../utils/output-formatter';
import * as path from 'path';

export function routeCommand(): Command {
  const cmd = new Command('route');

  cmd
    .description('Show which repositories a file will sync to based on routing rules')
    .argument('<file>', 'Markdown file to analyze')
    .option('--repos <list>', 'Comma-separated list of repos to test against')
    .option('--all', 'Test against all known repos (requires config)')
    .option('--json', 'Output as JSON')
    .action(async (file: string, options) => {
      try {
        // Resolve absolute path
        const filePath = path.resolve(process.cwd(), file);

        // Read file content
        const content = await readFileContent(filePath);

        // Check if file has frontmatter
        if (!hasFrontmatter(content)) {
          console.log(chalk.yellow('⚠ No frontmatter found in file'));
          console.log(chalk.dim('File will not sync to any repositories'));
          process.exit(1);
        }

        // Parse metadata
        const result = parseMetadata(content);

        if (!result.metadata) {
          console.error(chalk.red('Error: Failed to parse frontmatter'));
          process.exit(1);
        }

        // Load configuration
        const config = loadConfig({
          organizationSlug: result.metadata.org
        });

        // Determine target repositories
        let targetRepos: string[] = [];

        if (options.repos) {
          targetRepos = options.repos.split(',').map((r: string) => r.trim());
        } else {
          // Default test repositories if none specified
          targetRepos = [
            'api-gateway',
            'web-app',
            'mobile-app',
            'core-services',
            'test-harness',
            'docs-site'
          ];

          if (!options.json) {
            console.log(chalk.dim('Testing against default repositories. Use --repos to specify custom repos.\n'));
          }
        }

        // Analyze routing for each repo
        const decisions: Array<{ repo: string; willSync: boolean; reason: string }> = [];

        for (const targetRepo of targetRepos) {
          const willSync = shouldSyncToRepo({
            filePath: path.relative(process.cwd(), filePath),
            fileMetadata: result.metadata,
            targetRepo,
            sourceRepo: path.basename(process.cwd()),
            rules: config.rules
          });

          const reason = getRoutingReason(result.metadata, targetRepo, willSync);

          decisions.push({ repo: targetRepo, willSync, reason });
        }

        // Output results
        if (options.json) {
          const output = {
            file: path.relative(process.cwd(), filePath),
            metadata: result.metadata,
            decisions,
            summary: {
              willSyncTo: decisions.filter(d => d.willSync).length,
              willNotSyncTo: decisions.filter(d => !d.willSync).length,
              repositories: decisions.filter(d => d.willSync).map(d => d.repo)
            }
          };
          console.log(formatJSON(output));
        } else {
          console.log(chalk.bold(`File: ${chalk.cyan(path.relative(process.cwd(), filePath))}\n`));

          console.log(chalk.bold('Routing Analysis:\n'));

          for (const decision of decisions) {
            console.log(formatRoutingDecision(decision.repo, decision.willSync, decision.reason));
          }

          // Summary
          const willSyncRepos = decisions.filter(d => d.willSync);
          console.log(chalk.bold(`\nSummary:`));

          if (willSyncRepos.length > 0) {
            console.log(chalk.green(`  Will sync to ${willSyncRepos.length} repositor${willSyncRepos.length === 1 ? 'y' : 'ies'}:`));
            console.log(chalk.dim(`  ${willSyncRepos.map(d => d.repo).join(', ')}`));
          } else {
            console.log(chalk.yellow('  Will not sync to any repositories'));
          }
        }

      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  return cmd;
}

/**
 * Get human-readable routing reason
 */
function getRoutingReason(metadata: any, targetRepo: string, willSync: boolean): string {
  // Check include patterns
  const includes = metadata.codex_sync_include || [];
  const excludes = metadata.codex_sync_exclude || [];

  if (willSync) {
    // Find matching include pattern
    for (const pattern of includes) {
      if (pattern === '*' || matchesPattern(targetRepo, pattern)) {
        return `Matches include pattern '${pattern}'`;
      }
    }
    return 'Matches sync rules';
  } else {
    // Determine why it won't sync
    if (includes.length === 0) {
      return 'No include patterns defined';
    }

    // Check if excluded
    for (const pattern of excludes) {
      if (matchesPattern(targetRepo, pattern)) {
        return `Matches exclude pattern '${pattern}'`;
      }
    }

    // Doesn't match any include pattern
    return 'No matching include patterns';
  }
}

/**
 * Simple pattern matching (supports * wildcard)
 */
function matchesPattern(value: string, pattern: string): boolean {
  if (pattern === '*') return true;

  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
  return regex.test(value);
}
