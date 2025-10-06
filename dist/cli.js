#!/usr/bin/env node
"use strict";
/**
 * Fractary CLI - Unified command-line interface for all Fractary tools
 *
 * Command pattern: fractary <tool> <command> [options]
 *
 * Available tools:
 * - faber: Universal AI agent orchestration
 * - forge: [Coming soon]
 * - helm: [Coming soon]
 * - codex: [Coming soon]
 * - argus: [Coming soon]
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const faber_1 = require("./tools/faber");
// Package information
const packageJson = require('../package.json');
// Create main program
const program = new commander_1.Command();
program
    .name('fractary')
    .description('Unified CLI for all Fractary tools')
    .version(packageJson.version);
// Add tool commands
program.addCommand((0, faber_1.createFaberCommand)());
// Future tools (commented out until available)
// program.addCommand(createForgeCommand());
// program.addCommand(createHelmCommand());
// program.addCommand(createCodexCommand());
// program.addCommand(createArgusCommand());
// Show help if no tool specified
if (process.argv.length === 2) {
    program.outputHelp();
    process.exit(0);
}
// Error handling
program.exitOverride();
async function main() {
    try {
        await program.parseAsync(process.argv);
    }
    catch (error) {
        if (error.code === 'commander.help') {
            process.exit(0);
        }
        if (error.code === 'commander.unknownCommand') {
            console.error(chalk_1.default.red('Unknown command:'), error.message);
            console.log(chalk_1.default.gray('\nAvailable tools:'));
            console.log(chalk_1.default.gray('  faber  - Universal AI agent orchestration'));
            console.log(chalk_1.default.gray('  forge  - [Coming soon]'));
            console.log(chalk_1.default.gray('  helm   - [Coming soon]'));
            console.log(chalk_1.default.gray('  codex  - [Coming soon]'));
            console.log(chalk_1.default.gray('  argus  - [Coming soon]'));
            console.log(chalk_1.default.gray('\nRun "fractary --help" for more information.'));
            process.exit(1);
        }
        console.error(chalk_1.default.red('Error:'), error.message);
        process.exit(1);
    }
}
// Run CLI
main().catch(error => {
    console.error(chalk_1.default.red('Fatal error:'), error);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map