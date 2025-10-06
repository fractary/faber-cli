"use strict";
/**
 * Create command - Create new concepts
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
exports.createCommand = createCommand;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const yaml = __importStar(require("js-yaml"));
function createCommand() {
    return new commander_1.Command('create')
        .description('Create a new concept')
        .argument('<type>', 'Concept type (role, tool, eval, team, workflow)')
        .argument('<name>', 'Concept name')
        .option('--org <org>', 'Organization', 'myorg')
        .option('--system <system>', 'System', 'mysystem')
        .option('--platforms <list>', 'Supported platforms (comma-separated)')
        .option('--type <tool-type>', 'Tool type (for tools: mcp-server, utility, api-client)')
        .option('--members <list>', 'Team members (for teams: comma-separated)')
        .option('--target <concept>', 'Evaluation target (for evals)')
        .action(async (type, name, options) => {
        console.log(chalk_1.default.blue(`Creating ${type}: ${name}...`));
        try {
            const conceptPath = path.join(process.cwd(), `${type}s`, name);
            // Check if already exists
            try {
                await fs.access(conceptPath);
                throw new Error(`${type} '${name}' already exists`);
            }
            catch (error) {
                if (error.code !== 'ENOENT')
                    throw error;
            }
            // Create directory
            await fs.mkdir(conceptPath, { recursive: true });
            // Create metadata based on type
            let metadata;
            let metadataFile;
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
            await fs.writeFile(path.join(conceptPath, metadataFile), yaml.dump(metadata, { indent: 2 }), 'utf-8');
            // Create README
            const readmeContent = `# ${name}\n\n${metadata.description}\n\n## Created\n\n${metadata.created}`;
            await fs.writeFile(path.join(conceptPath, 'README.md'), readmeContent, 'utf-8');
            console.log(chalk_1.default.green(`✓ Created ${type} '${name}'`));
            console.log(chalk_1.default.gray(`  Path: ${conceptPath}`));
            console.log('\nNext steps:');
            console.log(`  1. Edit ${path.join(conceptPath, metadataFile)}`);
            console.log(`  2. Run: faber validate ${type} ${name}`);
        }
        catch (error) {
            console.error(chalk_1.default.red('Create failed:'), error.message);
            process.exit(1);
        }
    });
}
function createRoleMetadata(name, options) {
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
function createToolMetadata(name, options) {
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
function createEvalMetadata(name, options) {
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
function createTeamMetadata(name, options) {
    const members = options.members ? options.members.split(',').map((m) => ({
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
function createWorkflowMetadata(name, options) {
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
async function createRoleStructure(conceptPath) {
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
    await fs.writeFile(path.join(conceptPath, 'prompt.md'), '# Agent Prompt\n\nDefine agent behavior here.\n', 'utf-8');
}
async function createToolStructure(conceptPath, toolType) {
    if (toolType === 'mcp-server') {
        await fs.mkdir(path.join(conceptPath, 'mcp'), { recursive: true });
        await fs.mkdir(path.join(conceptPath, 'mcp/handlers'), { recursive: true });
    }
    await fs.mkdir(path.join(conceptPath, 'platforms'), { recursive: true });
    await fs.mkdir(path.join(conceptPath, 'bindings'), { recursive: true });
}
async function createEvalStructure(conceptPath) {
    await fs.mkdir(path.join(conceptPath, 'scenarios'), { recursive: true });
    await fs.mkdir(path.join(conceptPath, 'expectations'), { recursive: true });
    await fs.mkdir(path.join(conceptPath, 'platforms'), { recursive: true });
}
async function createTeamStructure(conceptPath) {
    await fs.mkdir(path.join(conceptPath, 'members'), { recursive: true });
    await fs.mkdir(path.join(conceptPath, 'workflows'), { recursive: true });
    await fs.mkdir(path.join(conceptPath, 'coordination'), { recursive: true });
    await fs.mkdir(path.join(conceptPath, 'platforms'), { recursive: true });
}
async function createWorkflowStructure(conceptPath) {
    await fs.mkdir(path.join(conceptPath, 'stages'), { recursive: true });
    await fs.mkdir(path.join(conceptPath, 'teams'), { recursive: true });
    await fs.mkdir(path.join(conceptPath, 'triggers'), { recursive: true });
}
//# sourceMappingURL=create.js.map