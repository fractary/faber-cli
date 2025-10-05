"use strict";
/**
 * Init command - Initialize a new Faber project
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCommand = initCommand;
const commander_1 = require("commander");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const yaml = __importStar(require("js-yaml"));
function initCommand() {
    return new commander_1.Command('init')
        .description('Initialize a new Faber project')
        .option('--template <name>', 'Use a template', 'default')
        .action(async (options) => {
        console.log(chalk_1.default.blue('Initializing Faber project...'));
        try {
            // Create project structure
            await createProjectStructure();
            // Create default config
            await createDefaultConfig();
            // Create example role
            if (options.template === 'default') {
                await createExampleRole();
            }
            console.log(chalk_1.default.green('✓ Faber project initialized successfully!'));
            console.log('\nNext steps:');
            console.log('  1. Review .faber/config.yml');
            console.log('  2. Run: faber list roles');
            console.log('  3. Run: faber validate role example-role');
            console.log('  4. Run: faber build claude role example-role');
        }
        catch (error) {
            console.error(chalk_1.default.red('Failed to initialize project:'), error.message);
            process.exit(1);
        }
    });
}
async function createProjectStructure() {
    const directories = [
        '.faber',
        '.faber/overlays',
        '.faber/overlays/organization',
        '.faber/overlays/organization/contexts',
        '.faber/overlays/organization/contexts/standards',
        '.faber/overlays/organization/contexts/references',
        '.faber/overlays/platforms',
        '.faber/overlays/roles',
        '.faber/overlays/teams',
        '.faber/overlays/workflows',
        'roles',
        'tools',
        'evals',
        'teams',
        'workflows',
        'deployments'
    ];
    for (const dir of directories) {
        await fs.mkdir(dir, { recursive: true });
    }
}
async function createDefaultConfig() {
    const config = {
        platforms: {
            'example-role': 'github-issues'
        },
        mcp_servers: {},
        overlays: {
            enabled: true,
            paths: ['.faber/overlays']
        },
        bindings: {}
    };
    const configPath = path.join('.faber', 'config.yml');
    const configContent = yaml.dump(config, { indent: 2 });
    await fs.writeFile(configPath, configContent, 'utf-8');
}
async function createExampleRole() {
    const rolePath = path.join('roles', 'example-role');
    await fs.mkdir(rolePath, { recursive: true });
    // Create agent.yml
    const agentMetadata = {
        org: 'example',
        system: 'demo',
        name: 'example-role',
        type: 'role',
        description: 'Example role demonstrating Faber-CLI capabilities',
        platforms: ['github-issues', 'linear'],
        default_platform: 'github-issues',
        platform_config_key: 'example-role',
        color: 'blue',
        agent_type: 'autonomous',
        tags: ['example', 'demo'],
        created: new Date().toISOString().split('T')[0],
        updated: new Date().toISOString().split('T')[0],
        visibility: 'public'
    };
    await fs.writeFile(path.join(rolePath, 'agent.yml'), yaml.dump(agentMetadata, { indent: 2 }), 'utf-8');
    // Create prompt.md
    const promptContent = `# Example Role Agent

You are an example agent demonstrating the Faber-CLI platform capabilities.

## Platform Detection and Context Loading

**CRITICAL - First Step**: Detect configured platform and load appropriate context.

1. Check \`.faber/config.yml\` for \`platforms.example-role\`
2. Load corresponding platform context:
   - **github-issues** → \`/contexts/platforms/platform-github-issues.md\`
   - **linear** → \`/contexts/platforms/platform-linear.md\`
3. If not configured, use default: github-issues

## Available Tasks

- [example-task](/tasks/example-task.md)

## Available Flows

- [example-flow](/flows/example-flow.md)

## Behavior Guidelines

1. Always detect platform first
2. Load appropriate contexts
3. Execute tasks according to platform
`;
    await fs.writeFile(path.join(rolePath, 'prompt.md'), promptContent, 'utf-8');
    // Create README.md
    const readmeContent = `# Example Role

This is an example role demonstrating Faber-CLI capabilities.

## Supported Platforms

- GitHub Issues
- Linear

## Usage

1. Configure platform in \`.faber/config.yml\`
2. Build for your framework: \`faber build claude role example-role\`
3. Deploy to target: \`faber deploy role example-role claude\`
`;
    await fs.writeFile(path.join(rolePath, 'README.md'), readmeContent, 'utf-8');
    // Create directories
    const subdirs = ['tasks', 'flows', 'contexts/specialists', 'contexts/platforms', 'contexts/standards'];
    for (const subdir of subdirs) {
        await fs.mkdir(path.join(rolePath, subdir), { recursive: true });
    }
    // Create example task
    const taskContent = `# Example Task

**Purpose**: Demonstrate task structure in Faber-CLI.

## Inputs

- \`param1\`: string - Example parameter
- \`param2\`: number - Another parameter

## Outputs

- \`result\`: string - Task result

## Platform-Agnostic Steps

1. Validate inputs
2. Process data
3. Return result

## Notes

- This is an example task
- Adapt to platform-specific operations
`;
    await fs.writeFile(path.join(rolePath, 'tasks', 'example-task.md'), taskContent, 'utf-8');
    // Create example flow
    const flowContent = `# Example Flow

**Purpose**: Demonstrate flow structure in Faber-CLI.

## Overview

This flow shows how to compose multiple tasks into a workflow.

## Prerequisites

- Platform configured
- Required permissions

## Flow Steps

### Step 1: Initialize
- **Task**: N/A
- **Action**: Set up workflow context

### Step 2: Execute Task
- **Task**: example-task
- **Action**: Run the example task

### Step 3: Complete
- **Action**: Finalize workflow

## Success Criteria

- All steps completed successfully
- Result returned to user
`;
    await fs.writeFile(path.join(rolePath, 'flows', 'example-flow.md'), flowContent, 'utf-8');
}
//# sourceMappingURL=init.js.map