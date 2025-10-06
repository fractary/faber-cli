"use strict";
/**
 * Parse Codex metadata command
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
exports.parseCommand = parseCommand;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const codex_1 = require("@fractary/codex");
const file_scanner_1 = require("../utils/file-scanner");
const output_formatter_1 = require("../utils/output-formatter");
const path = __importStar(require("path"));
function parseCommand() {
    const cmd = new commander_1.Command('parse');
    cmd
        .description('Parse and display frontmatter metadata from a file')
        .argument('<file>', 'Markdown file to parse')
        .option('--json', 'Output as JSON')
        .option('--yaml', 'Output as YAML')
        .option('--raw', 'Show raw frontmatter only')
        .option('--no-content', 'Hide content preview')
        .action(async (file, options) => {
        try {
            // Resolve absolute path
            const filePath = path.resolve(process.cwd(), file);
            // Read file content
            const content = await (0, file_scanner_1.readFileContent)(filePath);
            // Check if file has frontmatter
            if (!(0, codex_1.hasFrontmatter)(content)) {
                console.log(chalk_1.default.yellow('⚠ No frontmatter found in file'));
                process.exit(1);
            }
            // Handle raw output
            if (options.raw) {
                const raw = (0, codex_1.extractRawFrontmatter)(content);
                console.log(raw);
                return;
            }
            // Parse metadata
            const result = (0, codex_1.parseMetadata)(content);
            if (!result.metadata) {
                console.error(chalk_1.default.red('Error: Failed to parse frontmatter'));
                process.exit(1);
            }
            // Handle JSON output
            if (options.json) {
                const output = {
                    file: filePath,
                    metadata: result.metadata,
                    ...(options.content ? { content: result.content } : {})
                };
                console.log((0, output_formatter_1.formatJSON)(output));
                return;
            }
            // Handle YAML output
            if (options.yaml) {
                const yaml = require('js-yaml');
                console.log(yaml.dump(result.metadata));
                return;
            }
            // Default formatted output
            console.log(chalk_1.default.bold(`File: ${chalk_1.default.cyan(path.relative(process.cwd(), filePath))}\n`));
            console.log(chalk_1.default.bold('Metadata:'));
            console.log((0, output_formatter_1.formatMetadata)(result.metadata));
            // Content preview
            if (options.content && result.content) {
                console.log('\n' + chalk_1.default.bold('Content Preview:'));
                console.log(chalk_1.default.dim((0, output_formatter_1.formatContentPreview)(result.content, 10)));
            }
        }
        catch (error) {
            console.error(chalk_1.default.red('Error:'), error.message);
            process.exit(1);
        }
    });
    return cmd;
}
//# sourceMappingURL=parse.js.map