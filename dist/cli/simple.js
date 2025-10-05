#!/usr/bin/env node
"use strict";
/**
 * Simplified Faber CLI for initial release
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
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const packageJson = require('../../package.json');
async function ensureDir(dir) {
    try {
        await fs.mkdir(dir, { recursive: true });
    }
    catch (e) { }
}
async function writeFile(filePath, content) {
    await ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, 'utf-8');
}
commander_1.program
    .name('faber')
    .description('Universal AI agent orchestration platform')
    .version(packageJson.version);
// Init command
commander_1.program
    .command('init')
    .description('Initialize a new Faber project')
    .action(async () => {
    try {
        console.log(chalk_1.default.blue('Initializing Faber project...'));
        const dirs = [
            '.faber/overlays/organization',
            '.faber/overlays/platforms',
            '.faber/overlays/roles',
            'roles',
            'tools',
            'teams',
            'workflows',
            'evals',
            'deployments'
        ];
        for (const dir of dirs) {
            await ensureDir(dir);
        }
        const config = {
            platforms: {},
            mcp_servers: {},
            overlays: {
                enabled: true,
                paths: ['.faber/overlays']
            }
        };
        await writeFile('.faber/config.yml', `# Faber-CLI Configuration\n\n${JSON.stringify(config, null, 2)}`);
        console.log(chalk_1.default.green('✓ Initialized Faber project'));
    }
    catch (error) {
        console.error(chalk_1.default.red('Error:'), error.message);
        process.exit(1);
    }
});
// Create command
commander_1.program
    .command('create <type> <name>')
    .description('Create a new concept (role, tool, team, workflow, eval)')
    .option('--platforms <list>', 'Comma-separated platform list')
    .option('--description <desc>', 'Description')
    .action(async (type, name, options) => {
    try {
        const validTypes = ['role', 'tool', 'team', 'workflow', 'eval'];
        if (!validTypes.includes(type)) {
            throw new Error(`Invalid type: ${type}. Must be one of: ${validTypes.join(', ')}`);
        }
        console.log(chalk_1.default.blue(`Creating ${type}: ${name}`));
        const dir = path.join(`${type}s`, name);
        await ensureDir(dir);
        // Create basic metadata file
        const metadataFile = type === 'role' ? 'agent.yml' :
            type === 'team' ? 'team.yml' :
                type === 'workflow' ? 'workflow.yml' :
                    type === 'tool' ? 'tool.yml' :
                        'eval.yml';
        const metadata = `name: ${name}
description: ${options.description || `${type} ${name}`}
${type === 'role' && options.platforms ? `platforms:\n${options.platforms.split(',').map((p) => `  - ${p.trim()}`).join('\n')}` : ''}`;
        await writeFile(path.join(dir, metadataFile), metadata);
        // Create prompt.md for roles
        if (type === 'role') {
            await writeFile(path.join(dir, 'prompt.md'), `# ${name}\n\n${options.description || 'Role description'}\n\n## Core Behavior\n\n[Define agent behavior here]`);
            // Create subdirectories
            for (const subdir of ['tasks', 'flows', 'contexts']) {
                await ensureDir(path.join(dir, subdir));
            }
        }
        console.log(chalk_1.default.green(`✓ Created ${type}: ${name}`));
    }
    catch (error) {
        console.error(chalk_1.default.red('Error:'), error.message);
        process.exit(1);
    }
});
// List command
commander_1.program
    .command('list [type]')
    .description('List concepts')
    .action(async (type) => {
    try {
        const types = type ? [type] : ['role', 'tool', 'team', 'workflow', 'eval'];
        for (const t of types) {
            const dir = `${t}s`;
            try {
                const items = await fs.readdir(dir);
                if (items.length > 0) {
                    console.log(chalk_1.default.blue(`\n${t.charAt(0).toUpperCase() + t.slice(1)}s:`));
                    for (const item of items) {
                        console.log(`  - ${item}`);
                    }
                }
            }
            catch (e) {
                // Directory doesn't exist yet
            }
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error:'), error.message);
        process.exit(1);
    }
});
// Build command (simplified)
commander_1.program
    .command('build <framework> <type> <name>')
    .description('Build a deployment for a framework')
    .option('--output <dir>', 'Output directory', './deployments')
    .action(async (framework, type, name, options) => {
    try {
        console.log(chalk_1.default.blue(`Building ${type} "${name}" for ${framework}...`));
        const sourcePath = path.join(`${type}s`, name);
        // Check if source exists
        try {
            await fs.access(sourcePath);
        }
        catch {
            throw new Error(`${type} "${name}" not found`);
        }
        // For now, just create a simple output structure
        const outputDir = path.join(options.output, framework);
        if (framework === 'claude' && type === 'role') {
            // Create Claude Code structure
            const agentPath = path.join(outputDir, '.claude', 'agents', name + '.md');
            await ensureDir(path.dirname(agentPath));
            // Read prompt if exists
            let prompt = `# ${name}\n\nAgent for Claude Code`;
            try {
                prompt = await fs.readFile(path.join(sourcePath, 'prompt.md'), 'utf-8');
            }
            catch { }
            await writeFile(agentPath, prompt);
            console.log(chalk_1.default.green(`✓ Built ${framework} deployment`));
            console.log(chalk_1.default.gray(`  Output: ${agentPath}`));
        }
        else {
            console.log(chalk_1.default.yellow(`Framework "${framework}" support coming soon`));
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error:'), error.message);
        process.exit(1);
    }
});
// Validate command
commander_1.program
    .command('validate <type> <name>')
    .description('Validate a concept')
    .action(async (type, name) => {
    try {
        console.log(chalk_1.default.blue(`Validating ${type}: ${name}`));
        const dir = path.join(`${type}s`, name);
        // Check if exists
        try {
            await fs.access(dir);
            console.log(chalk_1.default.green(`✓ ${type} "${name}" exists`));
            // Check for required files
            const metadataFile = type === 'role' ? 'agent.yml' :
                type === 'team' ? 'team.yml' :
                    type === 'workflow' ? 'workflow.yml' :
                        type === 'tool' ? 'tool.yml' :
                            'eval.yml';
            try {
                await fs.access(path.join(dir, metadataFile));
                console.log(chalk_1.default.green(`✓ Metadata file exists`));
            }
            catch {
                console.log(chalk_1.default.yellow(`⚠ Missing metadata file: ${metadataFile}`));
            }
            if (type === 'role') {
                try {
                    await fs.access(path.join(dir, 'prompt.md'));
                    console.log(chalk_1.default.green(`✓ Prompt file exists`));
                }
                catch {
                    console.log(chalk_1.default.yellow(`⚠ Missing prompt.md`));
                }
            }
        }
        catch {
            console.log(chalk_1.default.red(`✗ ${type} "${name}" not found`));
            process.exit(1);
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error:'), error.message);
        process.exit(1);
    }
});
// Parse arguments
commander_1.program.parse(process.argv);
