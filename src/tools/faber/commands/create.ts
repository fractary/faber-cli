/**
 * Create command - Create new concepts
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'js-yaml';

export function createCommand(): Command {
  return new Command('create')
    .description('Create a new concept')
    .argument('<type>', 'Concept type (role, tool, eval, team, workflow)')
    .argument('<name>', 'Concept name')
    .option('--org <org>', 'Organization', 'myorg')
    .option('--system <system>', 'System', 'mysystem')
    .option('--platforms <list>', 'Supported platforms (comma-separated)')
    .option('--type <tool-type>', 'Tool type (for tools: mcp-server, utility, api-client)')
    .option('--members <list>', 'Team members (for teams: comma-separated)')
    .option('--target <concept>', 'Evaluation target (for evals)')
    .action(async (type: string, name: string, options) => {
      console.log(chalk.blue(`Creating ${type}: ${name}...`));

      try {
        const conceptPath = path.join(process.cwd(), `${type}s`, name);

        // Check if already exists
        try {
          await fs.access(conceptPath);
          throw new Error(`${type} '${name}' already exists`);
        } catch (error: any) {
          if (error.code !== 'ENOENT') throw error;
        }

        // Create directory
        await fs.mkdir(conceptPath, { recursive: true });

        // Create metadata based on type
        let metadata: any;
        let metadataFile: string;

        switch (type) {
          case 'role':
            metadata = createRoleMetadata(name, options);
            metadataFile = 'agent.yml';
            await createRoleStructure(conceptPath);
            break;

          case 'tool':
            metadata = createToolMetadata(name, options);
            metadataFile = 'tool.yml';
            await createToolStructure(conceptPath, options.type);
            break;

          case 'eval':
            metadata = createEvalMetadata(name, options);
            metadataFile = 'eval.yml';
            await createEvalStructure(conceptPath);
            break;

          case 'team':
            metadata = createTeamMetadata(name, options);
            metadataFile = 'team.yml';
            await createTeamStructure(conceptPath);
            break;

          case 'workflow':
            metadata = createWorkflowMetadata(name, options);
            metadataFile = 'workflow.yml';
            await createWorkflowStructure(conceptPath);
            break;

          default:
            throw new Error(`Unknown concept type: ${type}`);
        }

        // Write metadata
        await fs.writeFile(
          path.join(conceptPath, metadataFile),
          yaml.dump(metadata, { indent: 2 }),
          'utf-8'
        );

        // Create README
        const readmeContent = `# ${name}\n\n${metadata.description}\n\n## Created\n\n${metadata.created}`;
        await fs.writeFile(path.join(conceptPath, 'README.md'), readmeContent, 'utf-8');

        console.log(chalk.green(`✓ Created ${type} '${name}'`));
        console.log(chalk.gray(`  Path: ${conceptPath}`));
        console.log('\nNext steps:');
        console.log(`  1. Edit ${path.join(conceptPath, metadataFile)}`);
        console.log(`  2. Run: faber validate ${type} ${name}`);
      } catch (error: any) {
        console.error(chalk.red('Create failed:'), error.message);
        process.exit(1);
      }
    });
}

function createRoleMetadata(name: string, options: any): any {
  return {
    org: options.org,
    system: options.system,
    name,
    type: 'role',
    description: `${name} role`,
    platforms: options.platforms ? options.platforms.split(',') : [],
    created: new Date().toISOString().split('T')[0],
    updated: new Date().toISOString().split('T')[0],
    visibility: 'public',
    tags: []
  };
}

function createToolMetadata(name: string, options: any): any {
  return {
    org: options.org,
    system: options.system,
    name,
    type: 'tool',
    description: `${name} tool`,
    tool_type: options.type || 'utility',
    mcp_server: options.type === 'mcp-server',
    created: new Date().toISOString().split('T')[0],
    updated: new Date().toISOString().split('T')[0],
    visibility: 'public',
    tags: []
  };
}

function createEvalMetadata(name: string, options: any): any {
  return {
    org: options.org,
    system: options.system,
    name,
    type: 'eval',
    description: `${name} evaluation`,
    targets: options.target ? [options.target] : [],
    platforms: options.platforms ? options.platforms.split(',') : [],
    metrics: ['accuracy', 'completeness'],
    success_threshold: 80,
    created: new Date().toISOString().split('T')[0],
    updated: new Date().toISOString().split('T')[0],
    visibility: 'public',
    tags: []
  };
}

function createTeamMetadata(name: string, options: any): any {
  const members = options.members ? options.members.split(',').map((m: string) => ({
    role: m.trim(),
    name: m.trim()
  })) : [];

  return {
    org: options.org,
    system: options.system,
    name,
    type: 'team',
    description: `${name} team`,
    members,
    coordination: 'collaborative',
    created: new Date().toISOString().split('T')[0],
    updated: new Date().toISOString().split('T')[0],
    visibility: 'public',
    tags: []
  };
}

function createWorkflowMetadata(name: string, options: any): any {
  return {
    org: options.org,
    system: options.system,
    name,
    type: 'workflow',
    description: `${name} workflow`,
    stages: ['planning', 'execution', 'verification'],
    teams: [],
    triggers: ['manual'],
    created: new Date().toISOString().split('T')[0],
    updated: new Date().toISOString().split('T')[0],
    visibility: 'public',
    tags: []
  };
}

async function createRoleStructure(conceptPath: string): Promise<void> {
  const dirs = [
    'tasks',
    'flows',
    'contexts/specialists',
    'contexts/platforms',
    'contexts/standards',
    'contexts/patterns',
    'contexts/playbooks',
    'contexts/references',
    'contexts/troubleshooting',
    'bindings'
  ];

  for (const dir of dirs) {
    await fs.mkdir(path.join(conceptPath, dir), { recursive: true });
  }

  // Create prompt.md
  await fs.writeFile(
    path.join(conceptPath, 'prompt.md'),
    '# Agent Prompt\n\nDefine agent behavior here.\n',
    'utf-8'
  );
}

async function createToolStructure(conceptPath: string, toolType?: string): Promise<void> {
  if (toolType === 'mcp-server') {
    await fs.mkdir(path.join(conceptPath, 'mcp'), { recursive: true });
    await fs.mkdir(path.join(conceptPath, 'mcp/handlers'), { recursive: true });
  }

  await fs.mkdir(path.join(conceptPath, 'platforms'), { recursive: true });
  await fs.mkdir(path.join(conceptPath, 'bindings'), { recursive: true });
}

async function createEvalStructure(conceptPath: string): Promise<void> {
  await fs.mkdir(path.join(conceptPath, 'scenarios'), { recursive: true });
  await fs.mkdir(path.join(conceptPath, 'expectations'), { recursive: true });
  await fs.mkdir(path.join(conceptPath, 'platforms'), { recursive: true });
}

async function createTeamStructure(conceptPath: string): Promise<void> {
  await fs.mkdir(path.join(conceptPath, 'members'), { recursive: true });
  await fs.mkdir(path.join(conceptPath, 'workflows'), { recursive: true });
  await fs.mkdir(path.join(conceptPath, 'coordination'), { recursive: true });
  await fs.mkdir(path.join(conceptPath, 'platforms'), { recursive: true });
}

async function createWorkflowStructure(conceptPath: string): Promise<void> {
  await fs.mkdir(path.join(conceptPath, 'stages'), { recursive: true });
  await fs.mkdir(path.join(conceptPath, 'teams'), { recursive: true });
  await fs.mkdir(path.join(conceptPath, 'triggers'), { recursive: true });
}