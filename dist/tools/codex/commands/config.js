"use strict";
/**
 * Codex configuration management command
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
exports.configCommand = configCommand;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const codex_1 = require("@fractary/codex");
const file_scanner_1 = require("../utils/file-scanner");
const output_formatter_1 = require("../utils/output-formatter");
const path = __importStar(require("path"));
function configCommand() {
    const cmd = new commander_1.Command('config');
    cmd
        .description('View or edit Codex configuration')
        .argument('<action>', 'Action to perform: show, get, set, validate')
        .argument('[key]', 'Config key (for get/set actions)')
        .argument('[value]', 'Config value (for set action)')
        .option('--json', 'Output as JSON')
        .action(async (action, key, value, options) => {
        try {
            const configPath = path.join(process.cwd(), '.fractary', 'codex.config.json');
            switch (action) {
                case 'show':
                    await showConfig(configPath, options.json);
                    break;
                case 'get':
                    if (!key) {
                        console.error(chalk_1.default.red('Error: Key is required for get action'));
                        console.log(chalk_1.default.dim('Example: fractary codex config get organizationSlug'));
                        process.exit(1);
                    }
                    await getConfigValue(configPath, key, options.json);
                    break;
                case 'set':
                    if (!key || !value) {
                        console.error(chalk_1.default.red('Error: Key and value are required for set action'));
                        console.log(chalk_1.default.dim('Example: fractary codex config set organizationSlug fractary'));
                        process.exit(1);
                    }
                    await setConfigValue(configPath, key, value);
                    break;
                case 'validate':
                    await validateConfig(configPath);
                    break;
                default:
                    console.error(chalk_1.default.red(`Error: Unknown action: ${action}`));
                    console.log(chalk_1.default.dim('Valid actions: show, get, set, validate'));
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
 * Show configuration
 */
async function showConfig(configPath, asJson) {
    const exists = await (0, file_scanner_1.fileExists)(configPath);
    if (!exists) {
        console.error(chalk_1.default.red('Error: Configuration not found'));
        console.log(chalk_1.default.dim('Run "fractary codex init" to create configuration'));
        process.exit(1);
    }
    const content = await (0, file_scanner_1.readFileContent)(configPath);
    const config = JSON.parse(content);
    if (asJson) {
        console.log((0, output_formatter_1.formatJSON)(config));
        return;
    }
    console.log(chalk_1.default.bold('Codex Configuration\n'));
    console.log(chalk_1.default.bold('Organization:'));
    console.log(`  slug: ${chalk_1.default.cyan(config.organizationSlug || 'not set')}\n`);
    console.log(chalk_1.default.bold('Directories:'));
    console.log(`  source: ${chalk_1.default.dim(config.directories?.source || '.fractary')}`);
    console.log(`  target: ${chalk_1.default.dim(config.directories?.target || '.fractary')}`);
    console.log(`  systems: ${chalk_1.default.dim(config.directories?.systems || '.fractary/systems')}\n`);
    console.log(chalk_1.default.bold('Rules:'));
    console.log(`  preventSelfSync: ${config.rules?.preventSelfSync !== false ? chalk_1.default.green('true') : chalk_1.default.red('false')}`);
    console.log(`  preventCodexSync: ${config.rules?.preventCodexSync !== false ? chalk_1.default.green('true') : chalk_1.default.red('false')}`);
    console.log(`  allowProjectOverrides: ${config.rules?.allowProjectOverrides !== false ? chalk_1.default.green('true') : chalk_1.default.red('false')}`);
    if (config.rules?.autoSyncPatterns && config.rules.autoSyncPatterns.length > 0) {
        console.log(`  autoSyncPatterns: ${config.rules.autoSyncPatterns.length} pattern(s)\n`);
    }
    else {
        console.log(`  autoSyncPatterns: ${chalk_1.default.dim('none')}\n`);
    }
    console.log(chalk_1.default.dim(`Source: ${path.relative(process.cwd(), configPath)}`));
}
/**
 * Get config value
 */
async function getConfigValue(configPath, key, asJson) {
    const exists = await (0, file_scanner_1.fileExists)(configPath);
    if (!exists) {
        console.error(chalk_1.default.red('Error: Configuration not found'));
        process.exit(1);
    }
    const content = await (0, file_scanner_1.readFileContent)(configPath);
    const config = JSON.parse(content);
    // Support dot notation (e.g., "rules.preventSelfSync")
    const keys = key.split('.');
    let value = config;
    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        }
        else {
            console.error(chalk_1.default.red(`Error: Key not found: ${key}`));
            process.exit(1);
        }
    }
    if (asJson) {
        console.log((0, output_formatter_1.formatJSON)({ [key]: value }));
    }
    else {
        console.log(value);
    }
}
/**
 * Set config value
 */
async function setConfigValue(configPath, key, value) {
    const exists = await (0, file_scanner_1.fileExists)(configPath);
    if (!exists) {
        console.error(chalk_1.default.red('Error: Configuration not found'));
        process.exit(1);
    }
    const content = await (0, file_scanner_1.readFileContent)(configPath);
    const config = JSON.parse(content);
    // Support dot notation
    const keys = key.split('.');
    const lastKey = keys.pop();
    let target = config;
    for (const k of keys) {
        if (!target[k]) {
            target[k] = {};
        }
        target = target[k];
    }
    // Try to parse value as JSON (for objects, arrays, booleans, numbers)
    let parsedValue = value;
    try {
        parsedValue = JSON.parse(value);
    }
    catch {
        // Keep as string
    }
    target[lastKey] = parsedValue;
    // Write back
    await (0, file_scanner_1.writeFileContent)(configPath, JSON.stringify(config, null, 2));
    console.log(chalk_1.default.green('✓'), `Set ${chalk_1.default.cyan(key)} = ${parsedValue}`);
}
/**
 * Validate configuration
 */
async function validateConfig(configPath) {
    const exists = await (0, file_scanner_1.fileExists)(configPath);
    if (!exists) {
        console.error(chalk_1.default.red('Error: Configuration not found'));
        process.exit(1);
    }
    const content = await (0, file_scanner_1.readFileContent)(configPath);
    let config;
    try {
        config = JSON.parse(content);
    }
    catch (error) {
        console.error(chalk_1.default.red('✗ Invalid JSON:'), error.message);
        process.exit(1);
    }
    // Validate against schema
    const validation = codex_1.CodexConfigSchema.safeParse(config);
    if (!validation.success) {
        console.log(chalk_1.default.red('✗ Configuration validation failed:\n'));
        for (const issue of validation.error.issues) {
            const path = issue.path.join('.');
            console.log(chalk_1.default.red('  -'), `${path}: ${issue.message}`);
        }
        process.exit(1);
    }
    console.log(chalk_1.default.green('✓'), 'Configuration is valid');
}
//# sourceMappingURL=config.js.map