"use strict";
/**
 * Validate Codex metadata command
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
exports.validateCommand = validateCommand;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const codex_1 = require("@fractary/codex");
const file_scanner_1 = require("../utils/file-scanner");
const validation_reporter_1 = require("../utils/validation-reporter");
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
function validateCommand() {
    const cmd = new commander_1.Command('validate');
    cmd
        .description('Validate frontmatter metadata in markdown files')
        .argument('[path]', 'File or directory to validate', '.')
        .option('--pattern <glob>', 'Glob pattern to match files', '**/*.md')
        .option('--strict', 'Enable strict validation (fail on warnings)')
        .option('--json', 'Output results as JSON')
        .action(async (targetPath, options) => {
        try {
            const reporter = new validation_reporter_1.ValidationReporter();
            // Resolve absolute path
            const absPath = path.resolve(process.cwd(), targetPath);
            // Check if path exists
            const exists = await (0, file_scanner_1.fileExists)(absPath);
            if (!exists) {
                console.error(chalk_1.default.red(`Error: Path not found: ${targetPath}`));
                process.exit(1);
            }
            // Check if it's a file or directory
            const stats = await fs.stat(absPath);
            const isFile = stats.isFile();
            let filesToValidate = [];
            if (isFile) {
                // Single file
                filesToValidate = [absPath];
            }
            else {
                // Directory - scan for files
                if (!options.json) {
                    console.log(chalk_1.default.blue('Scanning for files...\n'));
                }
                const files = await (0, file_scanner_1.scanFiles)({
                    pattern: options.pattern,
                    cwd: absPath
                });
                filesToValidate = files.map(f => path.join(absPath, f));
                if (filesToValidate.length === 0) {
                    console.log(chalk_1.default.yellow('No files found matching pattern'));
                    process.exit(0);
                }
                if (!options.json) {
                    console.log(chalk_1.default.dim(`Found ${filesToValidate.length} file(s)\n`));
                }
            }
            // Validate each file
            if (!options.json) {
                console.log(chalk_1.default.blue('Validating Codex metadata...\n'));
            }
            for (const filePath of filesToValidate) {
                const result = await validateFile(filePath);
                reporter.addResult(result);
            }
            // Output results
            if (options.json) {
                console.log(JSON.stringify(reporter.toJSON(), null, 2));
            }
            else {
                reporter.print({ showWarnings: true, verbose: false });
            }
            // Exit with error code if validation failed
            if (reporter.hasErrors()) {
                process.exit(1);
            }
            if (options.strict && reporter.hasWarnings()) {
                process.exit(1);
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
 * Validate a single file
 */
async function validateFile(filePath) {
    const result = {
        filePath,
        valid: false,
        errors: [],
        warnings: []
    };
    try {
        // Read file content
        const content = await (0, file_scanner_1.readFileContent)(filePath);
        // Check if file has frontmatter
        if (!(0, codex_1.hasFrontmatter)(content)) {
            result.warnings.push('No frontmatter found (file will not sync)');
            return result;
        }
        // Parse metadata
        const parseResult = (0, codex_1.parseMetadata)(content);
        if (!parseResult.metadata) {
            result.errors.push('Failed to parse frontmatter');
            return result;
        }
        // Validate metadata
        const validation = (0, codex_1.validateMetadata)(parseResult.metadata);
        if (!validation.valid && validation.errors) {
            // Extract error messages
            for (const error of validation.errors) {
                result.errors.push(error);
            }
            return result;
        }
        // Validation successful
        result.valid = true;
        result.metadata = parseResult.metadata;
        // Check for potential issues (warnings)
        if (!result.metadata.codex_sync_include || result.metadata.codex_sync_include.length === 0) {
            result.warnings.push('No sync rules defined (codex_sync_include is empty)');
        }
        if (!result.metadata.org) {
            result.warnings.push('Missing org field (recommended)');
        }
        if (!result.metadata.system) {
            result.warnings.push('Missing system field (recommended)');
        }
    }
    catch (error) {
        result.errors.push(`Failed to validate: ${error.message}`);
    }
    return result;
}
//# sourceMappingURL=validate.js.map