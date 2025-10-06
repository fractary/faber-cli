"use strict";
/**
 * Show routing decisions for a file command
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
exports.routeCommand = routeCommand;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const codex_1 = require("@fractary/codex");
const file_scanner_1 = require("../utils/file-scanner");
const output_formatter_1 = require("../utils/output-formatter");
const path = __importStar(require("path"));
function routeCommand() {
    const cmd = new commander_1.Command('route');
    cmd
        .description('Show which repositories a file will sync to based on routing rules')
        .argument('<file>', 'Markdown file to analyze')
        .option('--repos <list>', 'Comma-separated list of repos to test against')
        .option('--all', 'Test against all known repos (requires config)')
        .option('--json', 'Output as JSON')
        .action(async (file, options) => {
        try {
            // Resolve absolute path
            const filePath = path.resolve(process.cwd(), file);
            // Read file content
            const content = await (0, file_scanner_1.readFileContent)(filePath);
            // Check if file has frontmatter
            if (!(0, codex_1.hasFrontmatter)(content)) {
                console.log(chalk_1.default.yellow('⚠ No frontmatter found in file'));
                console.log(chalk_1.default.dim('File will not sync to any repositories'));
                process.exit(1);
            }
            // Parse metadata
            const result = (0, codex_1.parseMetadata)(content);
            if (!result.metadata) {
                console.error(chalk_1.default.red('Error: Failed to parse frontmatter'));
                process.exit(1);
            }
            // Load configuration
            const config = (0, codex_1.loadConfig)({
                organizationSlug: result.metadata.org
            });
            // Determine target repositories
            let targetRepos = [];
            if (options.repos) {
                targetRepos = options.repos.split(',').map((r) => r.trim());
            }
            else {
                // Default test repositories if none specified
                targetRepos = [
                    'api-gateway',
                    'web-app',
                    'mobile-app',
                    'core-services',
                    'test-harness',
                    'docs-site'
                ];
                if (!options.json) {
                    console.log(chalk_1.default.dim('Testing against default repositories. Use --repos to specify custom repos.\n'));
                }
            }
            // Analyze routing for each repo
            const decisions = [];
            for (const targetRepo of targetRepos) {
                const willSync = (0, codex_1.shouldSyncToRepo)({
                    filePath: path.relative(process.cwd(), filePath),
                    fileMetadata: result.metadata,
                    targetRepo,
                    sourceRepo: path.basename(process.cwd()),
                    rules: config.rules
                });
                const reason = getRoutingReason(result.metadata, targetRepo, willSync);
                decisions.push({ repo: targetRepo, willSync, reason });
            }
            // Output results
            if (options.json) {
                const output = {
                    file: path.relative(process.cwd(), filePath),
                    metadata: result.metadata,
                    decisions,
                    summary: {
                        willSyncTo: decisions.filter(d => d.willSync).length,
                        willNotSyncTo: decisions.filter(d => !d.willSync).length,
                        repositories: decisions.filter(d => d.willSync).map(d => d.repo)
                    }
                };
                console.log((0, output_formatter_1.formatJSON)(output));
            }
            else {
                console.log(chalk_1.default.bold(`File: ${chalk_1.default.cyan(path.relative(process.cwd(), filePath))}\n`));
                console.log(chalk_1.default.bold('Routing Analysis:\n'));
                for (const decision of decisions) {
                    console.log((0, output_formatter_1.formatRoutingDecision)(decision.repo, decision.willSync, decision.reason));
                }
                // Summary
                const willSyncRepos = decisions.filter(d => d.willSync);
                console.log(chalk_1.default.bold(`\nSummary:`));
                if (willSyncRepos.length > 0) {
                    console.log(chalk_1.default.green(`  Will sync to ${willSyncRepos.length} repositor${willSyncRepos.length === 1 ? 'y' : 'ies'}:`));
                    console.log(chalk_1.default.dim(`  ${willSyncRepos.map(d => d.repo).join(', ')}`));
                }
                else {
                    console.log(chalk_1.default.yellow('  Will not sync to any repositories'));
                }
            }
        }
        catch (error) {
            console.error(chalk_1.default.red('Error:'), error.message);
            process.exit(1);
        }
    });
    return cmd;
}
/**
 * Get human-readable routing reason
 */
function getRoutingReason(metadata, targetRepo, willSync) {
    // Check include patterns
    const includes = metadata.codex_sync_include || [];
    const excludes = metadata.codex_sync_exclude || [];
    if (willSync) {
        // Find matching include pattern
        for (const pattern of includes) {
            if (pattern === '*' || matchesPattern(targetRepo, pattern)) {
                return `Matches include pattern '${pattern}'`;
            }
        }
        return 'Matches sync rules';
    }
    else {
        // Determine why it won't sync
        if (includes.length === 0) {
            return 'No include patterns defined';
        }
        // Check if excluded
        for (const pattern of excludes) {
            if (matchesPattern(targetRepo, pattern)) {
                return `Matches exclude pattern '${pattern}'`;
            }
        }
        // Doesn't match any include pattern
        return 'No matching include patterns';
    }
}
/**
 * Simple pattern matching (supports * wildcard)
 */
function matchesPattern(value, pattern) {
    if (pattern === '*')
        return true;
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(value);
}
//# sourceMappingURL=route.js.map