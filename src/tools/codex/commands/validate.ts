/**
 * Validate Codex metadata command
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { parseMetadata, validateMetadata, hasFrontmatter } from '@fractary/codex';
import { scanFiles, readFileContent, fileExists } from '../utils/file-scanner';
import { ValidationReporter, type ValidationResult } from '../utils/validation-reporter';
import * as path from 'path';
import * as fs from 'fs/promises';

export function validateCommand(): Command {
  const cmd = new Command('validate');

  cmd
    .description('Validate frontmatter metadata in markdown files')
    .argument('[path]', 'File or directory to validate', '.')
    .option('--pattern <glob>', 'Glob pattern to match files', '**/*.md')
    .option('--strict', 'Enable strict validation (fail on warnings)')
    .option('--json', 'Output results as JSON')
    .action(async (targetPath: string, options) => {
      try {
        const reporter = new ValidationReporter();

        // Resolve absolute path
        const absPath = path.resolve(process.cwd(), targetPath);

        // Check if path exists
        const exists = await fileExists(absPath);
        if (!exists) {
          console.error(chalk.red(`Error: Path not found: ${targetPath}`));
          process.exit(1);
        }

        // Check if it's a file or directory
        const stats = await fs.stat(absPath);
        const isFile = stats.isFile();

        let filesToValidate: string[] = [];

        if (isFile) {
          // Single file
          filesToValidate = [absPath];
        } else {
          // Directory - scan for files
          if (!options.json) {
            console.log(chalk.blue('Scanning for files...\n'));
          }

          const files = await scanFiles({
            pattern: options.pattern,
            cwd: absPath
          });

          filesToValidate = files.map(f => path.join(absPath, f));

          if (filesToValidate.length === 0) {
            console.log(chalk.yellow('No files found matching pattern'));
            process.exit(0);
          }

          if (!options.json) {
            console.log(chalk.dim(`Found ${filesToValidate.length} file(s)\n`));
          }
        }

        // Validate each file
        if (!options.json) {
          console.log(chalk.blue('Validating Codex metadata...\n'));
        }

        for (const filePath of filesToValidate) {
          const result = await validateFile(filePath);
          reporter.addResult(result);
        }

        // Output results
        if (options.json) {
          console.log(JSON.stringify(reporter.toJSON(), null, 2));
        } else {
          reporter.print({ showWarnings: true, verbose: false });
        }

        // Exit with error code if validation failed
        if (reporter.hasErrors()) {
          process.exit(1);
        }

        if (options.strict && reporter.hasWarnings()) {
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
 * Validate a single file
 */
async function validateFile(filePath: string): Promise<ValidationResult> {
  const result: ValidationResult = {
    filePath,
    valid: false,
    errors: [],
    warnings: []
  };

  try {
    // Read file content
    const content = await readFileContent(filePath);

    // Check if file has frontmatter
    if (!hasFrontmatter(content)) {
      result.warnings.push('No frontmatter found (file will not sync)');
      return result;
    }

    // Parse metadata
    const parseResult = parseMetadata(content);

    if (!parseResult.metadata) {
      result.errors.push('Failed to parse frontmatter');
      return result;
    }

    // Validate metadata
    const validation = validateMetadata(parseResult.metadata);

    if (!validation.valid && validation.errors) {
      // Extract error messages
      for (const error of validation.errors) {
        result.errors.push(error);
      }
      return result;
    }

    // Validation successful
    result.valid = true;
    result.metadata = parseResult.metadata;

    // Check for potential issues (warnings)
    if (!result.metadata.codex_sync_include || result.metadata.codex_sync_include.length === 0) {
      result.warnings.push('No sync rules defined (codex_sync_include is empty)');
    }

    if (!result.metadata.org) {
      result.warnings.push('Missing org field (recommended)');
    }

    if (!result.metadata.system) {
      result.warnings.push('Missing system field (recommended)');
    }

  } catch (error: any) {
    result.errors.push(`Failed to validate: ${error.message}`);
  }

  return result;
}
