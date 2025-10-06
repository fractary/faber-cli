/**
 * Build command - Build deployments
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs/promises';
import {
  ConceptType,
  ConfigLoader,
  OverlayResolver,
  RoleLoader,
  TeamLoader,
  ToolLoader,
  WorkflowLoader,
  EvalLoader,
  ClaudeCodeTransformer
} from '@fractary/faber';

export function buildCommand(): Command {
  return new Command('build')
    .description('Build a deployment for a concept')
    .argument('<framework>', 'Target framework (claude, langgraph, crewai)')
    .argument('<type>', 'Concept type (role, tool, eval, team, workflow)')
    .argument('<name>', 'Concept name')
    .option('--output <path>', 'Output directory', './deployments')
    .option('--no-overlays', 'Disable overlays')
    .action(async (framework: string, type: string, name: string, options) => {
      console.log(chalk.blue(`Building ${type} '${name}' for ${framework}...`));

      try {
        // Validate concept type
        if (!Object.values(ConceptType).includes(type as ConceptType)) {
          throw new Error(`Invalid concept type: ${type}`);
        }

        // Load concept
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
        const conceptPath = path.join(process.cwd(), `${type}s`, name);
        const concept = await loader.load(conceptPath);

        // Load config
        const configLoader = new ConfigLoader();
        const config = configLoader.load();

        // Load overlays
        let overlays;
        if (options.overlays !== false) {
          const overlayResolver = new OverlayResolver();
          const platform = config.platforms?.[name];
          overlays = await overlayResolver.resolveOverlays(type, name, platform);
          console.log(chalk.gray('  Loaded overlays'));
        } else {
          overlays = {
            organization: { contexts: [] },
            platforms: {},
            roles: {},
            teams: {},
            workflows: {}
          };
        }

        // Create binding
        let binding;
        if (framework === 'claude') {
          binding = new ClaudeCodeTransformer();
        } else {
          throw new Error(`Unknown framework: ${framework}`);
        }

        // Check if binding supports concept type
        const requirements = binding.getRequirements();
        if (!requirements.supportedConcepts.includes(type as ConceptType)) {
          throw new Error(`${framework} binding does not support ${type} concepts`);
        }

        // Transform to deployment
        console.log(chalk.gray('  Transforming with binding...'));
        const artifact = await binding.transform(concept, config, overlays);

        // Write deployment
        const outputBase = path.join(options.output, framework);
        console.log(chalk.gray(`  Writing to ${outputBase}...`));

        // Create directories
        for (const dir of artifact.directories) {
          await fs.mkdir(path.join(outputBase, dir), { recursive: true });
        }

        // Write files
        for (const [filePath, content] of artifact.files) {
          const fullPath = path.join(outputBase, filePath);
          await fs.mkdir(path.dirname(fullPath), { recursive: true });
          await fs.writeFile(fullPath, content, 'utf-8');
        }

        console.log(chalk.green(`✓ Built ${type} '${name}' for ${framework}`));
        console.log(chalk.gray(`  Output: ${outputBase}`));
        console.log(chalk.gray(`  Files: ${artifact.files.size}`));
      } catch (error: any) {
        console.error(chalk.red('Build failed:'), error.message);
        process.exit(1);
      }
    });
}