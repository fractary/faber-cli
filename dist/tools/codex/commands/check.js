"use strict";
/**
 * Check sync status command
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
exports.checkCommand = checkCommand;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const codex_1 = require("@fractary/codex");
const file_scanner_1 = require("../utils/file-scanner");
const output_formatter_1 = require("../utils/output-formatter");
const path = __importStar(require("path"));
function checkCommand() {
    const cmd = new commander_1.Command('check');
    cmd
        .description('Check which files need syncing')
        .option('--pattern <glob>', 'File pattern to match', '**/*.md')
        .option('--target <repo>', 'Check against specific repository')
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
            // Analyze files
            const readyToSync = [];
            const withoutRules = [];
            const noMetadata = [];
            for (const file of files) {
                const absPath = path.join(process.cwd(), file);
                try {
                    const content = await (0, file_scanner_1.readFileContent)(absPath);
                    if (!(0, codex_1.hasFrontmatter)(content)) {
                        noMetadata.push(file);
                        continue;
                    }
                    const result = (0, codex_1.parseMetadata)(content);
                    if (!result.metadata) {
                        noMetadata.push(file);
                        continue;
                    }
                    // Check if has sync rules
                    const includes = result.metadata.codex_sync_include || [];
                    const excludes = result.metadata.codex_sync_exclude || [];
                    if (includes.length === 0) {
                        withoutRules.push(file);
                        continue;
                    }
                    // Determine targets (simplified)
                    const targets = [];
                    if (includes.includes('*')) {
                        targets.push('all repositories');
                    }
                    else {
                        targets.push(...includes);
                    }
                    if (options.target) {
                        // Check if matches target
                        const matchesTarget = includes.some(pattern => {
                            if (pattern === '*')
                                return true;
                            const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
                            return regex.test(options.target);
                        });
                        const excludedFromTarget = excludes.some(pattern => {
                            const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
                            return regex.test(options.target);
                        });
                        if (matchesTarget && !excludedFromTarget) {
                            readyToSync.push({ path: file, targets: [options.target] });
                        }
                    }
                    else {
                        readyToSync.push({ path: file, targets });
                    }
                }
                catch (error) {
                    // Skip files that can't be read
                    continue;
                }
            }
            // Output results
            if (options.json) {
                const output = {
                    readyToSync: readyToSync.map(f => ({
                        file: f.path,
                        targets: f.targets
                    })),
                    withoutRules: withoutRules,
                    noMetadata: noMetadata,
                    summary: {
                        readyToSync: readyToSync.length,
                        withoutRules: withoutRules.length,
                        noMetadata: noMetadata.length
                    }
                };
                console.log((0, output_formatter_1.formatJSON)(output));
            }
            else {
                console.log(chalk_1.default.bold('Sync Status Check\n'));
                if (readyToSync.length > 0) {
                    console.log(chalk_1.default.bold('Files ready to sync:'));
                    for (const file of readyToSync) {
                        console.log(chalk_1.default.green('  ✓'), chalk_1.default.cyan(file.path), chalk_1.default.dim(`→ ${file.targets.join(', ')}`));
                    }
                    console.log();
                }
                if (withoutRules.length > 0) {
                    console.log(chalk_1.default.bold('Files without sync rules:'));
                    for (const file of withoutRules) {
                        console.log(chalk_1.default.yellow('  -'), chalk_1.default.dim(file), chalk_1.default.dim('(no codex_sync_include)'));
                    }
                    console.log();
                }
                if (noMetadata.length > 0) {
                    console.log(chalk_1.default.bold('Files without Codex metadata:'));
                    console.log(chalk_1.default.dim(`  ${noMetadata.length} file(s) without frontmatter`));
                    console.log();
                }
                // Summary
                console.log(chalk_1.default.bold('Summary:'));
                console.log(`  ${chalk_1.default.green(readyToSync.length)} file${readyToSync.length !== 1 ? 's' : ''} ready to sync`);
                console.log(`  ${chalk_1.default.yellow(withoutRules.length)} file${withoutRules.length !== 1 ? 's' : ''} without sync rules`);
                console.log(`  ${chalk_1.default.dim(noMetadata.length)} file${noMetadata.length !== 1 ? 's' : ''} without metadata`);
            }
        }
        catch (error) {
            console.error(chalk_1.default.red('Error:'), error.message);
            process.exit(1);
        }
    });
    return cmd;
}
//# sourceMappingURL=check.js.map