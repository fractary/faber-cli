"use strict";
/**
 * List files with Codex metadata command
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
const codex_1 = require("@fractary/codex");
const file_scanner_1 = require("../utils/file-scanner");
const output_formatter_1 = require("../utils/output-formatter");
const path = __importStar(require("path"));
function listCommand() {
    const cmd = new commander_1.Command('list');
    cmd
        .description('List all files with Codex metadata')
        .option('--pattern <glob>', 'File pattern to match', '**/*.md')
        .option('--system <name>', 'Filter by system name')
        .option('--tag <name>', 'Filter by tag')
        .option('--visibility <level>', 'Filter by visibility (public, internal, private)')
        .option('--json', 'Output as JSON')
        .action(async (options) => {
        try {
            // Scan for files
            const files = await (0, file_scanner_1.scanFiles)({
                pattern: options.pattern,
                cwd: process.cwd()
            });
            if (files.length === 0) {
                console.log(chalk_1.default.yellow('No files found'));
                process.exit(0);
            }
            // Parse and filter files
            const filesWithMetadata = [];
            for (const file of files) {
                const absPath = path.join(process.cwd(), file);
                try {
                    const content = await (0, file_scanner_1.readFileContent)(absPath);
                    if (!(0, codex_1.hasFrontmatter)(content)) {
                        continue;
                    }
                    const result = (0, codex_1.parseMetadata)(content);
                    if (!result.metadata) {
                        continue;
                    }
                    // Apply filters
                    if (options.system && result.metadata.system !== options.system) {
                        continue;
                    }
                    if (options.tag && (!result.metadata.tags || !result.metadata.tags.includes(options.tag))) {
                        continue;
                    }
                    if (options.visibility && result.metadata.visibility !== options.visibility) {
                        continue;
                    }
                    filesWithMetadata.push({
                        path: file,
                        metadata: result.metadata
                    });
                }
                catch (error) {
                    // Skip files that can't be read
                    continue;
                }
            }
            // Output results
            if (options.json) {
                console.log((0, output_formatter_1.formatJSON)(filesWithMetadata));
            }
            else {
                if (filesWithMetadata.length === 0) {
                    console.log(chalk_1.default.yellow('No files found with Codex metadata matching filters'));
                    process.exit(0);
                }
                console.log(chalk_1.default.bold('Files with Codex metadata:\n'));
                for (const file of filesWithMetadata) {
                    console.log(chalk_1.default.cyan(file.path));
                    const details = [];
                    if (file.metadata.system) {
                        details.push(`system: ${file.metadata.system}`);
                    }
                    if (file.metadata.tags && file.metadata.tags.length > 0) {
                        details.push(`tags: ${file.metadata.tags.join(', ')}`);
                    }
                    if (file.metadata.visibility) {
                        details.push(`visibility: ${file.metadata.visibility}`);
                    }
                    if (file.metadata.codex_sync_include && file.metadata.codex_sync_include.length > 0) {
                        details.push(`syncs to: ${file.metadata.codex_sync_include.join(', ')}`);
                    }
                    if (details.length > 0) {
                        console.log(chalk_1.default.dim('  ' + details.join('\n  ')));
                    }
                    console.log();
                }
                console.log(chalk_1.default.dim(`Found ${filesWithMetadata.length} file${filesWithMetadata.length !== 1 ? 's' : ''} with Codex metadata`));
            }
        }
        catch (error) {
            console.error(chalk_1.default.red('Error:'), error.message);
            process.exit(1);
        }
    });
    return cmd;
}
//# sourceMappingURL=list.js.map