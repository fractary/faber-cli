"use strict";
/**
 * List command - List concepts
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
exports.listCommand = listCommand;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const yaml = __importStar(require("js-yaml"));
const faber_1 = require("@fractary/faber");
function listCommand() {
    return new commander_1.Command('list')
        .description('List concepts in the project')
        .argument('[type]', 'Concept type to list (role, tool, eval, team, workflow)')
        .option('--verbose', 'Show detailed information')
        .action(async (type, options) => {
        try {
            if (type && !Object.values(faber_1.ConceptType).includes(type)) {
                throw new Error(`Invalid concept type: ${type}`);
            }
            const types = type ? [type] : ['role', 'tool', 'eval', 'team', 'workflow'];
            for (const conceptType of types) {
                await listConceptType(conceptType, options.verbose);
            }
        }
        catch (error) {
            console.error(chalk_1.default.red('List failed:'), error.message);
            process.exit(1);
        }
    });
}
async function listConceptType(type, verbose) {
    const pluralType = `${type}s`;
    const dirPath = path.join(process.cwd(), pluralType);
    // Check if directory exists
    try {
        await fs.access(dirPath);
    }
    catch {
        if (verbose) {
            console.log(chalk_1.default.yellow(`No ${pluralType} found`));
        }
        return;
    }
    // List concepts
    const items = await fs.readdir(dirPath);
    const concepts = [];
    for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = await fs.stat(itemPath);
        if (stats.isDirectory()) {
            // Try to load metadata
            const metadataFiles = ['agent.yml', 'tool.yml', 'eval.yml', 'team.yml', 'workflow.yml'];
            let metadata = null;
            for (const metadataFile of metadataFiles) {
                try {
                    const metadataPath = path.join(itemPath, metadataFile);
                    const content = await fs.readFile(metadataPath, 'utf-8');
                    metadata = yaml.load(content);
                    break;
                }
                catch {
                    // Try next file
                }
            }
            if (metadata) {
                concepts.push({
                    name: item,
                    ...metadata
                });
            }
            else {
                concepts.push({
                    name: item,
                    description: 'No metadata found'
                });
            }
        }
    }
    if (concepts.length === 0) {
        if (verbose) {
            console.log(chalk_1.default.yellow(`No ${pluralType} found`));
        }
        return;
    }
    // Display concepts
    console.log(chalk_1.default.bold(`\n${chalk_1.default.blue(pluralType.charAt(0).toUpperCase() + pluralType.slice(1))}:`));
    for (const concept of concepts) {
        if (verbose) {
            console.log(`\n  ${chalk_1.default.green(concept.name)}`);
            console.log(`    Description: ${concept.description || 'N/A'}`);
            if (concept.org)
                console.log(`    Organization: ${concept.org}`);
            if (concept.system)
                console.log(`    System: ${concept.system}`);
            if (concept.platforms)
                console.log(`    Platforms: ${concept.platforms.join(', ')}`);
            if (concept.tags)
                console.log(`    Tags: ${concept.tags.join(', ')}`);
            if (concept.visibility)
                console.log(`    Visibility: ${concept.visibility}`);
        }
        else {
            const description = concept.description
                ? concept.description.split('\n')[0].substring(0, 50) + '...'
                : 'No description';
            console.log(`  ${chalk_1.default.green(concept.name.padEnd(25))} ${chalk_1.default.gray(description)}`);
        }
    }
}
//# sourceMappingURL=list.js.map