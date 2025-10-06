"use strict";
/**
 * Build command - Build deployments
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
exports.buildCommand = buildCommand;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const faber_1 = require("@fractary/faber");
function buildCommand() {
    return new commander_1.Command('build')
        .description('Build a deployment for a concept')
        .argument('<framework>', 'Target framework (claude, langgraph, crewai)')
        .argument('<type>', 'Concept type (role, tool, eval, team, workflow)')
        .argument('<name>', 'Concept name')
        .option('--output <path>', 'Output directory', './deployments')
        .option('--no-overlays', 'Disable overlays')
        .action(async (framework, type, name, options) => {
        console.log(chalk_1.default.blue(`Building ${type} '${name}' for ${framework}...`));
        try {
            // Validate concept type
            if (!Object.values(faber_1.ConceptType).includes(type)) {
                throw new Error(`Invalid concept type: ${type}`);
            }
            // Load concept
            let loader;
            switch (type) {
                case faber_1.ConceptType.ROLE:
                    loader = new faber_1.RoleLoader();
                    break;
                case faber_1.ConceptType.TEAM:
                    loader = new faber_1.TeamLoader();
                    break;
                case faber_1.ConceptType.TOOL:
                    loader = new faber_1.ToolLoader();
                    break;
                case faber_1.ConceptType.WORKFLOW:
                    loader = new faber_1.WorkflowLoader();
                    break;
                case faber_1.ConceptType.EVAL:
                    loader = new faber_1.EvalLoader();
                    break;
                default:
                    throw new Error(`Unknown concept type: ${type}`);
            }
            const conceptPath = path.join(process.cwd(), `${type}s`, name);
            const concept = await loader.load(conceptPath);
            // Load config
            const configLoader = new faber_1.ConfigLoader();
            const config = configLoader.load();
            // Load overlays
            let overlays;
            if (options.overlays !== false) {
                const overlayResolver = new faber_1.OverlayResolver();
                const platform = config.platforms?.[name];
                overlays = await overlayResolver.resolveOverlays(type, name, platform);
                console.log(chalk_1.default.gray('  Loaded overlays'));
            }
            else {
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
                binding = new faber_1.ClaudeCodeTransformer();
            }
            else {
                throw new Error(`Unknown framework: ${framework}`);
            }
            // Check if binding supports concept type
            const requirements = binding.getRequirements();
            if (!requirements.supportedConcepts.includes(type)) {
                throw new Error(`${framework} binding does not support ${type} concepts`);
            }
            // Transform to deployment
            console.log(chalk_1.default.gray('  Transforming with binding...'));
            const artifact = await binding.transform(concept, config, overlays);
            // Write deployment
            const outputBase = path.join(options.output, framework);
            console.log(chalk_1.default.gray(`  Writing to ${outputBase}...`));
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
            console.log(chalk_1.default.green(`✓ Built ${type} '${name}' for ${framework}`));
            console.log(chalk_1.default.gray(`  Output: ${outputBase}`));
            console.log(chalk_1.default.gray(`  Files: ${artifact.files.size}`));
        }
        catch (error) {
            console.error(chalk_1.default.red('Build failed:'), error.message);
            process.exit(1);
        }
    });
}
//# sourceMappingURL=build.js.map